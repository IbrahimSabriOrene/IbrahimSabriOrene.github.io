// © AIHelpCenter | Author: Developer | Created: 2026-04-18

using AIHelpCenter.Ingestion.Interfaces;
using AIHelpCenter.Shared.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace AIHelpCenter.Ingestion.Storage;

/// <summary>
/// MinIO-backed implementation of <see cref="IAudioStorageService"/>.
/// Uploads raw audio streams to the configured MinIO bucket using the
/// tenant-scoped object key convention: <c>tenants/{tenantId}/inbox/{fileName}</c>.
/// All configuration (bucket name, endpoint, credentials) is consumed exclusively
/// through <see cref="MinioSettings"/>; no values are hard-coded.
/// </summary>
public sealed class MinioAudioStorageService : IAudioStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _settings;
    private readonly ILogger<MinioAudioStorageService> _logger;

    /// <summary>
    /// Initialises a new instance of <see cref="MinioAudioStorageService"/>.
    /// </summary>
    /// <param name="minioClient">
    /// The MinIO client used to communicate with object storage.
    /// Registered and configured by the Ingestion module's DI setup.
    /// </param>
    /// <param name="options">
    /// Strongly-typed options bound from <c>AiSettings:Minio</c> in application
    /// configuration. Must not be <see langword="null"/>.
    /// </param>
    /// <param name="logger">
    /// Structured logger injected by the runtime for this service.
    /// </param>
    /// <exception cref="ArgumentNullException">
    /// Thrown when any required dependency is <see langword="null"/>.
    /// </exception>
    public MinioAudioStorageService(
        IMinioClient minioClient,
        IOptions<MinioSettings> options,
        ILogger<MinioAudioStorageService> logger)
    {
        _minioClient = minioClient ?? throw new ArgumentNullException(nameof(minioClient));
        _settings = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Uploads a raw audio stream to MinIO object storage and returns the resulting
    /// object key that uniquely identifies the stored file.
    /// </summary>
    /// <param name="tenantId">
    /// The identifier of the tenant that owns this audio file.
    /// Used as the first path segment of the object key.
    /// </param>
    /// <param name="fileName">
    /// The original file name, used as the leaf segment of the object key.
    /// </param>
    /// <param name="contentType">
    /// The MIME content type of the audio stream (e.g. <c>audio/wav</c>, <c>audio/mpeg</c>).
    /// </param>
    /// <param name="data">
    /// A readable <see cref="Stream"/> containing the audio bytes.
    /// The caller is responsible for disposing the stream after this call returns.
    /// </param>
    /// <param name="size">
    /// The exact byte length of <paramref name="data"/>.
    /// Required by the MinIO SDK to stream the object efficiently.
    /// </param>
    /// <param name="ct">
    /// Token used to propagate cancellation from the caller into the MinIO operation.
    /// </param>
    /// <returns>
    /// The MinIO object key (<c>tenants/{tenantId}/inbox/{fileName}</c>) under which
    /// the file was stored.
    /// </returns>
    /// <exception cref="OperationCanceledException">
    /// Re-thrown without modification when <paramref name="ct"/> is cancelled.
    /// </exception>
    /// <exception cref="MinioException">
    /// Re-thrown without modification when the MinIO SDK reports a storage error.
    /// </exception>
    public async Task<string> UploadAsync(
        string tenantId,
        string fileName,
        string contentType,
        Stream data,
        long size,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Uploading file {FileName} for tenant {TenantId}",
            fileName, tenantId);

        var objectKey = $"tenants/{tenantId}/inbox/{fileName}";

        try
        {
            var putArgs = new PutObjectArgs()
                .WithBucket(_settings.Bucket)
                .WithObject(objectKey)
                .WithStreamData(data)
                .WithObjectSize(size)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putArgs, ct).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning(
                "Upload cancelled for {FileName} (tenant {TenantId})",
                fileName, tenantId);
            throw;
        }
        catch (MinioException ex)
        {
            _logger.LogError(
                ex,
                "{Class}.{Method} — MinIO storage error while uploading {FileName} for tenant {TenantId}. " +
                "Bucket: {Bucket}. Reason: {Reason}",
                nameof(MinioAudioStorageService), nameof(UploadAsync),
                fileName, tenantId,
                _settings.Bucket, ex.Message);
            throw;
        }

        _logger.LogInformation(
            "Successfully uploaded {FileName} to {ObjectKey}",
            fileName, objectKey);

        return objectKey;
    }
}
