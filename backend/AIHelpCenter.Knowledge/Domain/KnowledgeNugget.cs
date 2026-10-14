using AIHelpCenter.Shared.Primitives;

namespace AIHelpCenter.Knowledge.Domain;

public class KnowledgeNugget : AggregateRoot
{
    public string Content { get; private set; }
    public string Domain { get; private set; } // e.g., "MedicalTourism", "Dentistry"
    public string? SourceId { get; private set; } // Reference to a Conversation or Message
    public DateTime ExtractedAtUtc { get; private set; }
    public bool IsVerified { get; private set; }

    private KnowledgeNugget(Guid id, string content, string domain, string? sourceId)
        : base(id)
    {
        Content = content;
        Domain = domain;
        SourceId = sourceId;
        ExtractedAtUtc = DateTime.UtcNow;
        IsVerified = false;
    }

    public static KnowledgeNugget Create(string content, string domain, string? sourceId = null)
    {
        return new KnowledgeNugget(Guid.NewGuid(), content, domain, sourceId);
    }

    public void Verify() => IsVerified = true;
    public void UpdateContent(string newContent) => Content = newContent;
}
