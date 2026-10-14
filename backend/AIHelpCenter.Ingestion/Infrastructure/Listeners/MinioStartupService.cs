using AIHelpCenter.Shared.Settings;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.DataModel.Notification;

namespace AIHelpCenter.Ingestion.Infrastructure.Listeners;

/// <summary>
/// Runs once on application startup to ensure the MinIO bucket exists and the
/// s3:ObjectCreated:* event subscription is registered against the Redis notification
/// target (ARN arn:minio:sqs::PRIMARY:redis, matching MINIO_NOTIFY_REDIS_ENABLE_PRIMARY).
/// </summary>
public class MinioStartupService : IHostedService
{
    // Must match the suffix in MINIO_NOTIFY_REDIS_ENABLE_PRIMARY env var ("PRIMARY")
    private const string RedisNotificationArn = "arn:minio:sqs::PRIMARY:redis";

    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _settings;
    private readonly ILogger<MinioStartupService> _logger;

    public MinioStartupService(
        IMinioClient minioClient,
        IOptions<MinioSettings> settings,
        ILogger<MinioStartupService> logger)
    {
        _minioClient = minioClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await EnsureBucketExistsAsync(cancellationToken);
        await RegisterBucketNotificationAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task EnsureBucketExistsAsync(CancellationToken ct)
    {
        try
        {
            var existsArgs = new BucketExistsArgs().WithBucket(_settings.Bucket);
            bool exists = await _minioClient.BucketExistsAsync(existsArgs, ct);

            if (!exists)
            {
                var makeArgs = new MakeBucketArgs().WithBucket(_settings.Bucket);
                await _minioClient.MakeBucketAsync(makeArgs, ct);
                _logger.LogInformation("Created MinIO bucket '{Bucket}'", _settings.Bucket);
            }
            else
            {
                _logger.LogDebug("MinIO bucket '{Bucket}' already exists", _settings.Bucket);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure MinIO bucket '{Bucket}' exists", _settings.Bucket);
            throw;
        }
    }

    private async Task RegisterBucketNotificationAsync(CancellationToken ct)
    {
        try
        {
            var notification = new BucketNotification();

            var queueConfig = new QueueConfig(RedisNotificationArn);
            queueConfig.AddEvents([EventType.ObjectCreatedAll]);
            // Only fire for WAV uploads under the tenants/ prefix
            queueConfig.AddFilterPrefix("tenants/");
            queueConfig.AddFilterSuffix(".wav");

            notification.AddQueue(queueConfig);

            var setArgs = new SetBucketNotificationsArgs()
                .WithBucket(_settings.Bucket)
                .WithBucketNotificationConfiguration(notification);

            await _minioClient.SetBucketNotificationsAsync(setArgs, ct);

            _logger.LogInformation(
                "Registered s3:ObjectCreated:* notification on bucket '{Bucket}' → Redis ARN {Arn}",
                _settings.Bucket, RedisNotificationArn);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to register MinIO bucket notification for '{Bucket}'", _settings.Bucket);
            throw;
        }
    }
}
