namespace AIHelpCenter.Shared.Interfaces;

public interface IContext
{
    string? TenantId { get; }
    string? UserId { get; }
}
