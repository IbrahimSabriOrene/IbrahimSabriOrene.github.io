// © AIHelpCenter | Author: Developer | Created: 2026-04-18

namespace AIHelpCenter.Ingestion.Interfaces;

/// <summary>
/// Abstracts raw binary upload operations to the configured object storage backend (MinIO).
/// Implementations are responsible for constructing the storage path and transferring bytes.
/// </summary>
public interface IAudioStorageService
{
    /// <summary>
    /// Uploads an audio stream to the configured MinIO bucket and returns the resulting
    /// object key (storage path) that uniquely identifies the file within the bucket.
    /// </summary>
    /// <param name="tenantId">The tenant that owns this file. Used to build the storage path.</param>
    /// <param name="fileName">The original file name including extension (e.g. "call-001.wav").</param>
    /// <param name="contentType">MIME type of the audio stream (e.g. "audio/wav").</param>
    /// <param name="data">The raw audio byte stream to upload. The caller is responsible for disposing.</param>
    /// <param name="size">Total byte length of <paramref name="data"/>. Required by the MinIO SDK.</param>
    /// <param name="ct">Token to observe for cancellation requests.</param>
    /// <returns>
    /// The MinIO object key in the format <c>tenants/{tenantId}/inbox/{fileName}</c>.
    /// This value should be stored as <see cref="Domain.AudioFile.StoragePath"/>.
    /// </returns>
    Task<string> UploadAsync(
        string tenantId,
        string fileName,
        string contentType,
        Stream data,
        long size,
        CancellationToken ct = default);
}
