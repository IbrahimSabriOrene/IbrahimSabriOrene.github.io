using Microsoft.Extensions.Configuration;
using Weaviate.Client;

namespace AIHelpCenter.Intelligence.Infrastructure.Persistence;

public class WeaviateStore
{
    private WeaviateClient? _client;
    private readonly string _baseUrl;

    public WeaviateStore(IConfiguration configuration)
    {
        _baseUrl = configuration["AiSettings:Weaviate:BaseUrl"] ?? "http://localhost:9080";
    }

    private async Task<WeaviateClient> GetClientAsync()
    {
        if (_client == null)
        {
            // v4 client uses Connect.Local for local instances
            _client = await Connect.Local(_baseUrl);
        }
        return _client;
    }

    public async Task<(bool IsHealthy, string? Message)> IsHealthyAsync()
    {
        try
        {
            var client = await GetClientAsync();
            var meta = await client.GetMeta();
            return (true, $"Version: {meta.Version}");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    // Add methods for schema creation, vector search, etc.
}
