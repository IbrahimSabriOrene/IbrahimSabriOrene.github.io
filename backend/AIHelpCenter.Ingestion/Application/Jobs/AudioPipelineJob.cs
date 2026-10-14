// using System.Text.Json; // Reserved for diarization serialization — re-enable when diarizer is reactivated
using AIHelpCenter.Ingestion.Interfaces;
using AIHelpCenter.Shared.Settings;
using Hangfire.Server;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace AIHelpCenter.Ingestion.Application.Jobs;

/// <summary>
/// Hangfire job that performs GPU-bound audio processing (DeepFilterNet noise removal).
/// Resolved via DI per invocation — runs inside the GPU singleton worker (WorkerCount=1).
/// </summary>
/// <remarks>
/// NOTE: Speaker diarization via Pyannote.audio (step 3) is currently <b>INACTIVE</b>.
/// Pyannote requires a CUDA-capable GPU with ≥ 8 GB VRAM to run at a practical speed.
/// On CPU it runs 10–30× real-time, making it unusable for production.
/// The diarization step has been commented out until dedicated GPU resources are available.
/// To re-enable: uncomment step 3 below, restore the Diarizer HTTP client in
/// DependencyInjection.cs, and un-comment the diarizer service in docker-compose.yml.
/// </remarks>
public class AudioPipelineJob
{
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _minioSettings;
    private readonly IAudioFileRepository _audioFileRepository;
    private readonly IAudioProcessingService _audioProcessingService;
    private readonly ILogger<AudioPipelineJob> _logger;

    public AudioPipelineJob(
        IMinioClient minioClient,
        IOptions<MinioSettings> minioSettings,
        IAudioFileRepository audioFileRepository,
        IAudioProcessingService audioProcessingService,
        ILogger<AudioPipelineJob> logger)
    {
        _minioClient = minioClient;
        _minioSettings = minioSettings.Value;
        _audioFileRepository = audioFileRepository;
        _audioProcessingService = audioProcessingService;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid audioFileId, PerformContext? context, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GPU pipeline started for AudioFile {AudioFileId}", audioFileId);

        var audioFile = await _audioFileRepository.GetByIdAsync(audioFileId, cancellationToken);
        if (audioFile is null)
        {
            _logger.LogError("AudioFile {AudioFileId} not found, aborting pipeline", audioFileId);
            return;
        }

        try
        {
            audioFile.MarkAsProcessing();
            await _audioFileRepository.UpdateAsync(audioFile, cancellationToken);

            var bucketName = _minioSettings.Bucket;

            // 1. Download raw audio from MinIO
            using var rawStream = new MemoryStream();
            var getArgs = new GetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(audioFile.StoragePath)
                .WithCallbackStream(stream => stream.CopyTo(rawStream));

            await _minioClient.GetObjectAsync(getArgs, cancellationToken);
            rawStream.Position = 0;

            _logger.LogInformation("Downloaded raw audio ({Bytes} bytes) for {AudioFileId}",
                rawStream.Length, audioFileId);

            // 2. DeepFilterNet — noise removal (GPU)
            var enhancedStream = await _audioProcessingService.EnhanceAudioAsync(
                rawStream, audioFile.FileName, cancellationToken);

            var storagePath = audioFile.StoragePath;
            var processedPath = storagePath.Replace("/inbox/", "/processed/");
            var cleanObjectName = $"{processedPath[..processedPath.LastIndexOf('/')]}/clean_{audioFile.FileName}";

            using var enhancedMemory = new MemoryStream();
            await enhancedStream.CopyToAsync(enhancedMemory, cancellationToken);
            enhancedMemory.Position = 0;

            var putCleanArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(cleanObjectName)
                .WithObjectSize(enhancedMemory.Length)
                .WithStreamData(enhancedMemory)
                .WithContentType("audio/wav");

            await _minioClient.PutObjectAsync(putCleanArgs, cancellationToken);
            audioFile.SetCleanAudio(cleanObjectName);
            await _audioFileRepository.UpdateAsync(audioFile, cancellationToken);

            _logger.LogInformation("Enhancement complete for {AudioFileId}, stored at {Path}",
                audioFileId, cleanObjectName);

            // ── Step 3: Pyannote speaker diarization — INACTIVE ──────────────
            // Disabled: Pyannote.audio requires a dedicated GPU (≥ 8 GB VRAM).
            // CPU inference is 10–30× real-time and completely impractical.
            // Re-enable this block once a CUDA-capable GPU appliance is provisioned.
            // ─────────────────────────────────────────────────────────────────
            // enhancedMemory.Position = 0;
            // var segments = await _audioProcessingService.DiarizeAudioAsync(
            //     enhancedMemory, audioFile.FileName, cancellationToken);
            // var segmentsJson = JsonSerializer.Serialize(segments);
            // audioFile.SetDiarization(segmentsJson);
            // await _audioFileRepository.UpdateAsync(audioFile, cancellationToken);
            // _logger.LogInformation(
            //     "Diarization complete for {AudioFileId}: {SegmentCount} segments detected",
            //     audioFileId, segments.Count);

            _logger.LogInformation(
                "Diarization skipped for {AudioFileId} — diarizer is INACTIVE (GPU required)",
                audioFileId);

            // Phase 1 complete (DeepFilter only) — mark as completed until Whisper (Phase 2) is wired in
            audioFile.MarkAsCompleted();
            await _audioFileRepository.UpdateAsync(audioFile, cancellationToken);

            _logger.LogInformation("Phase 1 pipeline completed for AudioFile {AudioFileId}", audioFileId);

            // TODO Phase 2: enqueue Whisper transcription job here
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GPU pipeline failed for AudioFile {AudioFileId}", audioFileId);
            audioFile.MarkAsFailed();
            await _audioFileRepository.UpdateAsync(audioFile, cancellationToken);
        }
    }
}
