// © AIHelpCenter | Author: Developer | Created: 2026-04-18

using AIHelpCenter.Ingestion.Interfaces;
using AIHelpCenter.Ingestion.Models;
using AIHelpCenter.Shared.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;
using Minio.Exceptions;

namespace AIHelpCenter.Api.Controllers;

/// <summary>
/// Handles HTTP requests related to audio file ingestion and status queries.
/// All business logic is delegated to the Ingestion module — this controller
/// only maps HTTP concerns (request/response) to service calls.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AudioController : ControllerBase
{
    private readonly ITenantProvider _tenantProvider;
    private readonly IAudioIngestionService _ingestionService;
    private readonly IAudioFileRepository _audioFileRepository;
    private readonly ILogger<AudioController> _logger;

    /// <summary>
    /// Initializes a new instance of <see cref="AudioController"/>.
    /// </summary>
    /// <param name="tenantProvider">Resolves the current tenant from the request context.</param>
    /// <param name="ingestionService">Orchestrates storage upload and entity persistence.</param>
    /// <param name="audioFileRepository">Read access to persisted audio file records.</param>
    /// <param name="logger">Structured logger for this controller.</param>
    public AudioController(
        ITenantProvider tenantProvider,
        IAudioIngestionService ingestionService,
        IAudioFileRepository audioFileRepository,
        ILogger<AudioController> logger)
    {
        _tenantProvider = tenantProvider;
        _ingestionService = ingestionService;
        _audioFileRepository = audioFileRepository;
        _logger = logger;
    }

    /// <summary>
    /// Returns the current processing status of a previously uploaded audio file.
    /// </summary>
    /// <param name="id">The unique identifier of the audio file.</param>
    /// <returns>
    /// 200 OK with a status payload, or 404 Not Found if no record exists for the given ID.
    /// </returns>
    [HttpGet("{id:guid}/status")]
    public async Task<IActionResult> GetStatusAsync(Guid id)
    {
        _logger.LogInformation(
            "[{Class}.{Method}] Fetching status for AudioFile '{AudioFileId}'.",
            nameof(AudioController), nameof(GetStatusAsync), id);

        try
        {
            var audioFile = await _audioFileRepository.GetByIdAsync(id, HttpContext.RequestAborted);

            if (audioFile is null)
            {
                _logger.LogWarning(
                    "[{Class}.{Method}] AudioFile '{AudioFileId}' was not found.",
                    nameof(AudioController), nameof(GetStatusAsync), id);

                return NotFound(new { Error = $"AudioFile '{id}' was not found." });
            }

            _logger.LogInformation(
                "[{Class}.{Method}] Returning status '{Status}' for AudioFile '{AudioFileId}'.",
                nameof(AudioController), nameof(GetStatusAsync),
                audioFile.Status, id);

            return Ok(new
            {
                AudioId = audioFile.Id,
                Status = audioFile.Status.ToString(),
                FileName = audioFile.FileName,
                TenantId = audioFile.TenantId,
                HasCleanAudio = audioFile.CleanStoragePath is not null,
                HasDiarization = audioFile.DiarizationJson is not null,
                CreatedAtUtc = audioFile.CreatedAtUtc
            });
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning(
                "[{Class}.{Method}] Request was cancelled while fetching status for AudioFile '{AudioFileId}'.",
                nameof(AudioController), nameof(GetStatusAsync), id);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[{Class}.{Method}] Unexpected error fetching status for AudioFile '{AudioFileId}'.",
                nameof(AudioController), nameof(GetStatusAsync), id);

            return StatusCode(500, new { Error = "An unexpected error occurred. Please try again." });
        }
    }

    /// <summary>
    /// Accepts one or more audio files, uploads them to object storage,
    /// and creates the corresponding domain records.
    /// </summary>
    /// <param name="files">The list of audio files submitted as multipart/form-data.</param>
    /// <returns>
    /// 200 OK with a list of created audio file IDs, 400 Bad Request if no files are provided,
    /// 401 Unauthorized if the tenant cannot be resolved, or 502 Bad Gateway if
    /// object storage is unavailable.
    /// </returns>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(500L * 1024 * 1024)] // 500 MB — matches Kestrel limit in Program.cs
    [RequestFormLimits(MultipartBodyLengthLimit = 500L * 1024 * 1024)]
    public async Task<IActionResult> UploadAudioAsync([FromForm] List<IFormFile> files)
    {
        _logger.LogInformation(
            "[{Class}.{Method}] Upload request received with {FileCount} file(s).",
            nameof(AudioController), nameof(UploadAudioAsync), files.Count);

        if (files is not { Count: > 0 })
        {
            _logger.LogWarning(
                "[{Class}.{Method}] Upload request contained no files.",
                nameof(AudioController), nameof(UploadAudioAsync));

            return BadRequest(new { Error = "At least one file must be provided." });
        }

        var tenantId = _tenantProvider.GetTenantId();

        if (tenantId is null)
        {
            _logger.LogWarning(
                "[{Class}.{Method}] Could not resolve tenant from the current request context.",
                nameof(AudioController), nameof(UploadAudioAsync));

            return Unauthorized(new { Error = "Tenant could not be resolved from the current request." });
        }

        try
        {
            // We could create the guids on database level??
            var createdIds = new List<Guid>(files.Count);

            foreach (var file in files)
            {
                _logger.LogInformation(
                    "[{Class}.{Method}] Processing file '{FileName}' ({ContentType}, {Size} bytes) for tenant '{TenantId}'.",
                    nameof(AudioController), nameof(UploadAudioAsync),
                    file.FileName, file.ContentType, file.Length, tenantId);

                using var stream = file.OpenReadStream();

                var item = new AudioUploadItem(
                    FileName: file.FileName,
                    ContentType: file.ContentType ?? "application/octet-stream", // what is octet stream
                    Data: stream,
                    Size: file.Length);

                var audioFile = await _ingestionService.IngestAsync(tenantId, item, HttpContext.RequestAborted);

                createdIds.Add(audioFile.Id);
            }

            _logger.LogInformation(
                "[{Class}.{Method}] Successfully ingested {FileCount} file(s) for tenant '{TenantId}'. IDs: {AudioFileIds}",
                nameof(AudioController), nameof(UploadAudioAsync),
                files.Count, tenantId, createdIds);

            return Ok(new
            {
                Message = $"{createdIds.Count} file(s) uploaded successfully.",
                AudioFileIds = createdIds
            });
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning(
                "[{Class}.{Method}] Upload request was cancelled by the client for tenant '{TenantId}'.",
                nameof(AudioController), nameof(UploadAudioAsync), tenantId);
            throw;
        }
        catch (MinioException ex)
        {
            _logger.LogError(ex,
                "[{Class}.{Method}] Object storage is unavailable for tenant '{TenantId}'. Reason: {Reason}",
                nameof(AudioController), nameof(UploadAudioAsync), tenantId, ex.Message);

            return StatusCode(502, new { Error = "Object storage is currently unavailable. Please try again later." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[{Class}.{Method}] Unexpected error during upload for tenant '{TenantId}'.",
                nameof(AudioController), nameof(UploadAudioAsync), tenantId);

            return StatusCode(500, new { Error = "An unexpected error occurred. Please try again." });
        }
    }
}
