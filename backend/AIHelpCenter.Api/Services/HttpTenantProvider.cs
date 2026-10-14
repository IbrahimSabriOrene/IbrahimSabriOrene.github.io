using AIHelpCenter.Shared.Interfaces;

namespace AIHelpCenter.Api.Services;

public class HttpTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? GetTenantId()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();
    }
}
