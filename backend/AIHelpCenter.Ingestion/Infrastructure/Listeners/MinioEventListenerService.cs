using System.Text.Json;
using System.Web;
using AIHelpCenter.Ingestion.Application.Jobs;
using AIHelpCenter.Ingestion.Domain;
using AIHelpCenter.Ingestion.Interfaces;
using Hangfire;
using Hangfire.States;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace AIHelpCenter.Ingestion.Infrastructure.Listeners;

/// <summary>
/// Long-running background service that pops MinIO bucket notifications from the Redis
/// list and creates AudioFile entities + enqueues GPU processing jobs.
///
/// Uses IServiceScopeFactory to create a fresh DI scope per event batch so that the
/// scoped IngestionDbContext is never captured inside this singleton host service.
/// </summary>
public class MinioEventListenerService : BackgroundService
{
    private const string RedisKey = "minio-events";

    private readonly IConnectionMultiplexer _redis;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IBackgroundJobClient _jobClient;
    private readonly ILogger<MinioEventListenerService> _logger;

    public MinioEventListenerService(
        IConnectionMultiplexer redis,
        IServiceScopeFactory scopeFactory,
        IBackgroundJobClient jobClient,
        ILogger<MinioEventListenerService> logger)
    {
        _redis = redis;
        _scopeFactory = scopeFactory;
        _jobClient = jobClient;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MinIO event listener started, watching Redis key '{Key}'", RedisKey);

        var db = _redis.GetDatabase();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = await db.ListRightPopAsync(RedisKey);
                if (result.IsNull)
                {
                    await Task.Delay(1_000, stoppingToken);
                    continue;
                }

                await ProcessEventAsync(result!, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing MinIO event, will retry in 5 seconds");
                await Task.Delay(5_000, stoppingToken);
            }
        }

        _logger.LogInformation("MinIO event listener stopped");
    }

    private async Task ProcessEventAsync(string json, CancellationToken ct)
    {
        var entries = JsonSerializer.Deserialize<List<MinioRedisAccessEntry>>(json);
        var records = entries?.SelectMany(e => e.Event).ToList();

        if (records is not { Count: > 0 })
        {
            _logger.LogWarning("Received empty or unparseable MinIO event: {Json}", json);
            return;
        }

        // One DbContext scope per event batch — safe inside a singleton host service.
        await using var scope = _scopeFactory.CreateAsyncScope();
        var audioFileRepository = scope.ServiceProvider.GetRequiredService<IAudioFileRepository>();

        foreach (var record in records)
        {
            // ── Guard 1: only process object-created events ───────────────────
            if (!record.EventName.StartsWith("s3:ObjectCreated:", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Ignoring non-create event '{EventName}'", record.EventName);
                continue;
            }

            // ── Guard 2: only process WAV files ───────────────────────────────
            var objectKey = HttpUtility.UrlDecode(record.S3.Object.Key);
            if (!objectKey.EndsWith(".wav", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Ignoring non-WAV object: {Key}", objectKey);
                continue;
            }

            // ── Guard 3: only process inbox uploads, not processed output ─────
            // DeepFilter writes back to /processed/ — without this guard every
            // clean_*.wav would re-trigger ingestion indefinitely.
            if (!objectKey.Contains("/inbox/", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Ignoring non-inbox object: {Key}", objectKey);
                continue;
            }

            // ── Guard 4: key must follow tenants/{id}/inbox/{file} convention ─
            string tenantId;
            try
            {
                tenantId = AudioFile.ParseTenantFromObjectKey(objectKey);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Skipping object with unexpected path format: {Key}", objectKey);
                continue;
            }

            var fileName = Path.GetFileName(objectKey);
            var contentType = string.IsNullOrEmpty(record.S3.Object.ContentType)
                ? "audio/wav"
                : record.S3.Object.ContentType;

            var audioFile = AudioFile.Create(
                fileName, contentType, record.S3.Object.Size, objectKey, tenantId);

            await audioFileRepository.AddAsync(audioFile, ct);

            _jobClient.Create<AudioPipelineJob>(
                job => job.ExecuteAsync(audioFile.Id, null!, CancellationToken.None),
                new EnqueuedState("gpu-batch"));

            _logger.LogInformation(
                "Ingested {FileName} for tenant {TenantId} — AudioFile {AudioFileId} enqueued on gpu-batch",
                fileName, tenantId, audioFile.Id);
        }
    }
}
