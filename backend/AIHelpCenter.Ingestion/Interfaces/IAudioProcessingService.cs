namespace AIHelpCenter.Ingestion.Interfaces;

public record SpeakerSegment(double Start, double End, string Speaker);

public interface IAudioProcessingService
{
    Task<Stream> EnhanceAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default);
    Task<List<SpeakerSegment>> DiarizeAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default);
}
