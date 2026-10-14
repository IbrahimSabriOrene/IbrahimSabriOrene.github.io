using AIHelpCenter.Shared.Primitives;

namespace AIHelpCenter.Ingestion.Domain;

public class AudioFile : AggregateRoot
{
    public string FileName { get; private set; }
    public string ContentType { get; private set; }
    public long FileSize { get; private set; }
    public string StoragePath { get; private set; }
    public string TenantId { get; private set; }
    public string? CleanStoragePath { get; private set; }
    public string? DiarizationJson { get; private set; }
    public ProcessingStatus Status { get; private set; }
    public string? Transcription { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    /// <summary>Required by EF Core for entity materialization. Do not use directly.</summary>
    protected AudioFile() : base()
    {
        FileName = null!;
        ContentType = null!;
        StoragePath = null!;
        TenantId = null!;
    }

    private AudioFile(Guid id, string fileName, string contentType, long fileSize, string storagePath, string tenantId)
        : base(id)
    {
        FileName = fileName;
        ContentType = contentType;
        FileSize = fileSize;
        StoragePath = storagePath;
        TenantId = tenantId;
        Status = ProcessingStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static AudioFile Create(string fileName, string contentType, long fileSize, string storagePath, string tenantId)
    {
        return new AudioFile(Guid.NewGuid(), fileName, contentType, fileSize, storagePath, tenantId);
    }

    /// <summary>
    /// Extracts tenant ID from a standard S3 object key: "tenants/{tenantId}/inbox/{file}"
    /// </summary>
    public static string ParseTenantFromObjectKey(string objectKey)
    {
        var parts = objectKey.Split('/');
        if (parts.Length >= 2 && parts[0] == "tenants")
            return parts[1];

        throw new ArgumentException($"Cannot extract tenant from object key: {objectKey}");
    }

    public void MarkAsProcessing() => Status = ProcessingStatus.Processing;

    public void SetCleanAudio(string storagePath) => CleanStoragePath = storagePath;

    public void SetDiarization(string json) => DiarizationJson = json;

    /// <summary>
    /// Marks Phase 1 (DeepFilter noise removal + Pyannote diarization) as complete.
    /// Phase 2 (Whisper transcription) is still pending and has not yet been executed.
    /// </summary>
    public void MarkAsCompleted() => Status = ProcessingStatus.Completed;

    public void SetTranscription(string transcription)
    {
        Transcription = transcription;
        Status = ProcessingStatus.Completed;
    }

    public void MarkAsFailed() => Status = ProcessingStatus.Failed;
}

public enum ProcessingStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}
