namespace AIHelpCenter.Shared.Settings;

public class MinioSettings
{
    public const string SectionName = "AiSettings:Minio";
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Bucket { get; set; } = "audio-hub";
    public bool UseSsl { get; set; } = false;
}
