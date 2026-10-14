using AIHelpCenter.Intelligence.Infrastructure.Ai;
using AIHelpCenter.Intelligence.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace AIHelpCenter.Intelligence;

public static class DependencyInjection
{
    public static IServiceCollection AddIntelligenceModule(this IServiceCollection services)
    {
        services.AddSingleton<SemanticKernelService>();
        services.AddSingleton<WeaviateStore>();
        
        return services;
    }
}
