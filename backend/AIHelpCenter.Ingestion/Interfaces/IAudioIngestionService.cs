// © AIHelpCenter | Author: Developer | Created: 2026-04-18

using AIHelpCenter.Ingestion.Domain;
using AIHelpCenter.Ingestion.Models;

namespace AIHelpCenter.Ingestion.Interfaces;

/// <summary>
/// Orchestrates the full ingestion flow for a single audio file upload:
/// persists binary data to object storage and creates the corresponding
/// <see cref="AudioFile"/> domain entity in the repository.
/// </summary>
public interface IAudioIngestionService
{
    /// <summary>
    /// Uploads the audio stream to object storage and persists a new
    /// <see cref="AudioFile"/> domain entity.
    /// </summary>
    /// <param name="tenantId">The tenant that owns the file.</param>
    /// <param name="item">
    /// Transport object carrying the raw stream and file metadata.
    /// The caller is responsible for disposing the stream after this call returns.
    /// </param>
    /// <param name="ct">Token used to cancel the operation.</param>
    /// <returns>The newly created and persisted <see cref="AudioFile"/> entity.</returns>
    Task<AudioFile> IngestAsync(string tenantId, AudioUploadItem item, CancellationToken ct = default);
}
