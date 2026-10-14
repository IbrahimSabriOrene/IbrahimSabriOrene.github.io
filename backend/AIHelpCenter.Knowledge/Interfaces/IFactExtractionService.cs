namespace AIHelpCenter.Knowledge.Interfaces;

public interface IFactExtractionService
{
    Task ExtractAndStoreNuggetsAsync(string text, string sourceId);
}
