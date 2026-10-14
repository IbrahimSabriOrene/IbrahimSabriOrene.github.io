using AIHelpCenter.Intelligence.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace AIHelpCenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCheckController : ControllerBase
{
    private readonly WeaviateStore _weaviateStore;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public HealthCheckController(
        WeaviateStore weaviateStore,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _weaviateStore = weaviateStore;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> CheckHealth()
    {
        var status = new Dictionary<string, string>();

        // Weaviate
        try
        {
            var (isHealthy, message) = await _weaviateStore.IsHealthyAsync();
            status["Weaviate"] = isHealthy ? $"Healthy ({message})" : $"Unhealthy: {message}";
        }
        catch (Exception ex)
        {
            status["Weaviate"] = $"Error: {ex.Message}";
        }

        // Ollama
        try
        {
            var ollamaUrl = _configuration["AiSettings:Ollama:BaseUrl"] ?? "http://localhost:11434";
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{ollamaUrl}/api/tags");
            status["Ollama"] = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";
        }
        catch (Exception ex)
        {
            status["Ollama"] = $"Error: {ex.Message}";
        }

        // Whisper
        try
        {
            var whisperUrl = _configuration["AiSettings:Whisper:BaseUrl"] ?? "http://localhost:8001";
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{whisperUrl}/health");
            status["Whisper"] = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";
        }
        catch (Exception ex)
        {
            status["Whisper"] = $"Error: {ex.Message}";
        }

        // Audio Processor (Spleeter/Diarization)
        try
        {
            var audioProcessorUrl = _configuration["AiSettings:AudioProcessor:BaseUrl"] ?? "http://localhost:8002";
            var client = _httpClientFactory.CreateClient();
            // Assuming the audio processor has a /health or similar endpoint
            var response = await client.GetAsync($"{audioProcessorUrl}/health");
            status["Audio Processor"] = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";
        }
        catch (Exception ex)
        {
            status["Audio Processor"] = $"Error: {ex.Message}";
        }

        return Ok(status);
    }
}
