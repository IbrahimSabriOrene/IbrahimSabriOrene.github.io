using AIHelpCenter.Shared.Primitives;

namespace AIHelpCenter.Intelligence.Domain;

public class Conversation : AggregateRoot
{
    private readonly List<Message> _messages = new();
    public IReadOnlyCollection<Message> Messages => _messages.AsReadOnly();
    public string? TenantId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private Conversation(Guid id, string? tenantId)
        : base(id)
    {
        TenantId = tenantId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static Conversation Create(string? tenantId)
    {
        return new Conversation(Guid.NewGuid(), tenantId);
    }

    public void AddMessage(string role, string content)
    {
        _messages.Add(new Message(Guid.NewGuid(), Id, role, content));
    }
}

public class Message : Entity
{
    public Guid ConversationId { get; private set; }
    public string Role { get; private set; }
    public string Content { get; private set; }
    public DateTime Timestamp { get; private set; }

    public Message(Guid id, Guid conversationId, string role, string content)
        : base(id)
    {
        ConversationId = conversationId;
        Role = role;
        Content = content;
        Timestamp = DateTime.UtcNow;
    }
}
