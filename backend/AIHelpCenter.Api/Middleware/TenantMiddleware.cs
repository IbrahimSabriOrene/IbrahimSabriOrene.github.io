using AIHelpCenter.Shared.Interfaces;

namespace AIHelpCenter.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider)
    {
        var tenantId = context.Request.Headers["X-Tenant-ID"].FirstOrDefault();
        
        // In a real app, you'd set this in a scoped service or AsyncLocal
        // For now, we'll just ensure it's available in the context if needed
        
        await _next(context);
    }
}
