using System.Text.Json.Serialization;

namespace AIHelpCenter.Ingestion.Infrastructure.Listeners;

/// <summary>
/// DTOs for deserializing MinIO S3 bucket notification events.
/// The Redis "access" format wraps events as: [{"Event":[...records...], "EventTime":"..."}]
/// </summary>
public sealed class MinioRedisAccessEntry
{
    [JsonPropertyName("Event")]
    public List<S3EventRecord> Event { get; set; } = [];

    [JsonPropertyName("EventTime")]
    public string EventTime { get; set; } = string.Empty;
}

public sealed class S3EventRecord
{
    [JsonPropertyName("eventVersion")]
    public string EventVersion { get; set; } = string.Empty;

    [JsonPropertyName("eventSource")]
    public string EventSource { get; set; } = string.Empty;

    [JsonPropertyName("eventTime")]
    public string EventTime { get; set; } = string.Empty;

    [JsonPropertyName("eventName")]
    public string EventName { get; set; } = string.Empty;

    [JsonPropertyName("userIdentity")]
    public S3UserIdentity UserIdentity { get; set; } = new();

    [JsonPropertyName("s3")]
    public S3Data S3 { get; set; } = new();
}

public sealed class S3UserIdentity
{
    [JsonPropertyName("principalId")]
    public string PrincipalId { get; set; } = string.Empty;
}

public sealed class S3Data
{
    [JsonPropertyName("bucket")]
    public S3Bucket Bucket { get; set; } = new();

    [JsonPropertyName("object")]
    public S3Object Object { get; set; } = new();
}

public sealed class S3Bucket
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("arn")]
    public string Arn { get; set; } = string.Empty;
}

public sealed class S3Object
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("eTag")]
    public string ETag { get; set; } = string.Empty;

    [JsonPropertyName("contentType")]
    public string ContentType { get; set; } = string.Empty;
}
