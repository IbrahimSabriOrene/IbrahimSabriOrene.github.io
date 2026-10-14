// © AIHelpCenter | Author: Developer | Created: 2026-04-18

using AIHelpCenter.Ingestion.Domain;
using AIHelpCenter.Ingestion.Interfaces;
using AIHelpCenter.Ingestion.Models;
using Microsoft.Extensions.Logging;

namespace AIHelpCenter.Ingestion.Services;

/// <summary>
/// Orchestrates the full ingestion pipeline for a single audio upload:
/// delegates binary persistence to <see cref="IAudioStorageService"/> and
/// records the resulting domain entity via <see cref="IAudioFileRepository"/>.
/// </summary>
public sealed class AudioIngestionService : IAudioIngestionService
{
    private readonly IAudioStorageService _storageService;
    private readonly IAudioFileRepository _repository;
    private readonly ILogger<AudioIngestionService> _logger;

    /// <summary>
    /// Initialises a new instance of <see cref="AudioIngestionService"/>.
    /// </summary>
    /// <param name="storageService">
    /// Service responsible for uploading the raw audio bytes to object storage.
    /// </param>
    /// <param name="repository">
    /// Repository used to persist the newly created <see cref="AudioFile"/> entity.
    /// </param>
    /// <param name="logger">
    /// Structured logger injected by the runtime for this service.
    /// </param>
    /// <exception cref="ArgumentNullException">
    /// Thrown when any required dependency is <see langword="null"/>.
    /// </exception>
    public AudioIngestionService(
        IAudioStorageService storageService,
        IAudioFileRepository repository,
        ILogger<AudioIngestionService> logger)
    {
        _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Uploads the audio stream to object storage and persists a new
    /// <see cref="AudioFile"/> domain entity to the repository.
    /// </summary>
    /// <param name="tenantId">
    /// The identifier of the tenant that owns the audio file.
    /// Forwarded verbatim to storage and domain creation.
    /// </param>
    /// <param name="item">
    /// Transport object carrying the raw stream and file metadata.
    /// The caller is responsible for disposing the stream after this call returns.
    /// </param>
    /// <param name="ct">
    /// Token used to propagate cancellation from the caller into every
    /// downstream async operation. Never suppressed or ignored.
    /// </param>
    /// <returns>
    /// The newly created and persisted <see cref="AudioFile"/> entity,
    /// with <see cref="AudioFile.StoragePath"/> set to the object key
    /// returned by object storage.
    /// </returns>
    /// <exception cref="OperationCanceledException">
    /// Re-thrown without modification when <paramref name="ct"/> is cancelled
    /// at any point during upload or persistence.
    /// </exception>
    /// <exception cref="Exception">
    /// Any non-cancellation exception thrown by storage or the repository
    /// is logged and re-thrown without modification.
    /// </exception>
    public async Task<AudioFile> IngestAsync(
        string tenantId,
        AudioUploadItem item,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Ingesting file {FileName} for tenant {TenantId}",
            item.FileName, tenantId);

        try
        {
            var storagePath = await _storageService
                .UploadAsync(tenantId, item.FileName, item.ContentType, item.Data, item.Size, ct)
                .ConfigureAwait(false);

            var audioFile = AudioFile.Create(
                item.FileName,
                item.ContentType,
                item.Size,
                storagePath,
                tenantId);


            // fire and forget?? Needs hangfire?
            await _repository.AddAsync(audioFile, ct).ConfigureAwait(false);

            _logger.LogInformation(
                "AudioFile {AudioFileId} ingested for tenant {TenantId}",
                audioFile.Id, tenantId);

            return audioFile;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning(
                "Ingestion cancelled for {FileName} (tenant {TenantId})",
                item.FileName, tenantId);
            throw;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(
                ex,
                "{Class}.{Method} — failed to ingest file {FileName} for tenant {TenantId}. Reason: {Reason}",
                nameof(AudioIngestionService), nameof(IngestAsync),
                item.FileName, tenantId, ex.Message);
            throw;
        }
    }
}
