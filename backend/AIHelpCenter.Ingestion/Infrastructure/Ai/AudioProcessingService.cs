using System.Net.Http.Headers;
using System.Net.Http.Json;
using AIHelpCenter.Ingestion.Interfaces;

namespace AIHelpCenter.Ingestion.Infrastructure.Ai;

public class AudioProcessingService : IAudioProcessingService
{
    internal const string DeepFilterClientName = "DeepFilter";
    // INACTIVE: Diarizer client name kept for future re-activation.
    // See docker-compose.yml and DependencyInjection.cs for re-enable instructions.
    internal const string DiarizerClientName = "Diarizer";

    private readonly IHttpClientFactory _httpClientFactory;

    public AudioProcessingService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<Stream> EnhanceAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default)
    {
        using var content = new MultipartFormDataContent();

        if (audioStream.CanSeek)
            audioStream.Position = 0;

        var streamContent = new StreamContent(audioStream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
        content.Add(streamContent, "file", fileName);

        var client = _httpClientFactory.CreateClient(DeepFilterClientName);
        var response = await client.PostAsync("/enhance", content, ct);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStreamAsync(ct);
    }

    // ── DIARIZER — INACTIVE ───────────────────────────────────────────────────
    // Speaker diarization via Pyannote.audio has been disabled because it
    // requires a dedicated GPU (VRAM ≥ 8 GB) to run at practical speed.
    // On CPU, Pyannote runs at 10–30× real-time, making it unsuitable for
    // production without a GPU appliance.
    //
    // To re-enable:
    //   1. Provision a CUDA-capable GPU and uncomment the diarizer service
    //      in docker-compose.yml.
    //   2. Uncomment the HTTP client registration in DependencyInjection.cs.
    //   3. Restore the original implementation below and uncomment step 3
    //      in AudioPipelineJob.cs.
    // ─────────────────────────────────────────────────────────────────────────
    public Task<List<SpeakerSegment>> DiarizeAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default)
    {
        // Diarization is inactive — return an empty segment list so the rest
        // of the pipeline (Whisper transcription) continues without speaker attribution.
        return Task.FromResult(new List<SpeakerSegment>());

        // ── Original implementation (restore when GPU is available) ──────────
        // using var content = new MultipartFormDataContent();
        //
        // if (audioStream.CanSeek)
        //     audioStream.Position = 0;
        //
        // var streamContent = new StreamContent(audioStream);
        // streamContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
        // content.Add(streamContent, "file", fileName);
        //
        // var client = _httpClientFactory.CreateClient(DiarizerClientName);
        // var response = await client.PostAsync("/diarize", content, ct);
        // response.EnsureSuccessStatusCode();
        //
        // var result = await response.Content.ReadFromJsonAsync<DiarizationResponse>(cancellationToken: ct);
        // return result?.Segments ?? new List<SpeakerSegment>();
    }

    private record DiarizationResponse(List<SpeakerSegment> Segments);
}
