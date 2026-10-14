using AIHelpCenter.Shared.Interfaces;

namespace AIHelpCenter.Intelligence.Interfaces;

public interface IRagService
{
    IAsyncEnumerable<string> GetChatResponseAsync(string query, string? callId = null);
}
