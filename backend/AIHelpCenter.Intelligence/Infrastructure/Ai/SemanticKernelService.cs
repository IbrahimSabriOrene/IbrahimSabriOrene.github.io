using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Ollama;

namespace AIHelpCenter.Intelligence.Infrastructure.Ai;

public class SemanticKernelService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletion;

    public SemanticKernelService(IConfiguration configuration)
    {
        var ollamaUrl = configuration["AiSettings:Ollama:BaseUrl"] ?? "http://localhost:11434";
        var chatModel = configuration["AiSettings:Ollama:ChatModel"] ?? "llama3";

        var builder = Kernel.CreateBuilder();
        
        // Add Ollama Chat Completion
        builder.AddOllamaChatCompletion(
            modelId: chatModel,
            endpoint: new Uri(ollamaUrl));

        _kernel = builder.Build();
        _chatCompletion = _kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<string> GetResponseAsync(string prompt, CancellationToken cancellationToken = default)
    {
        var history = new ChatHistory();
        history.AddUserMessage(prompt);

        var result = await _chatCompletion.GetChatMessageContentAsync(
            history,
            kernel: _kernel,
            cancellationToken: cancellationToken);

        return result.Content ?? string.Empty;
    }
}
