// © AIHelpCenter | Author: Developer | Created: 2026-04-18

using AIHelpCenter.Ingestion.Application.Jobs;
using AIHelpCenter.Ingestion.Infrastructure.Ai;
using AIHelpCenter.Ingestion.Infrastructure.Listeners;
using AIHelpCenter.Ingestion.Infrastructure.Persistence;
using AIHelpCenter.Ingestion.Interfaces;
using AIHelpCenter.Ingestion.Services;
using AIHelpCenter.Ingestion.Storage;
using AIHelpCenter.Shared.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using StackExchange.Redis;

namespace AIHelpCenter.Ingestion;

/// <summary>
/// Registers all services belonging to the Ingestion module into the DI container.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds the Ingestion module services: MinIO client, Redis, EF Core DbContext,
    /// repositories, audio storage, audio ingestion orchestration, HTTP clients,
    /// and background listeners.
    /// </summary>
    /// <param name="services">The service collection to register into.</param>
    /// <param name="configuration">Application configuration used to bind settings sections.</param>
    /// <returns>The same <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddIngestionModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── MinIO ─────────────────────────────────────────────────────────────
        services.Configure<MinioSettings>(
            configuration.GetSection(MinioSettings.SectionName));

        var minioSettings = configuration
            .GetSection(MinioSettings.SectionName)
            .Get<MinioSettings>() ?? new MinioSettings();

        services.AddMinio(configureSource => configureSource
            .WithEndpoint(minioSettings.Endpoint)
            .WithCredentials(minioSettings.AccessKey, minioSettings.SecretKey)
            .WithSSL(minioSettings.UseSsl)
            .Build());

        // ── Redis ─────────────────────────────────────────────────────────────
        var redisConnectionString =
            configuration["AiSettings:Redis:ConnectionString"] ?? "localhost:6379";

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(redisConnectionString));

        // ── EF Core / PostgreSQL ──────────────────────────────────────────────
        var connectionString =
            configuration.GetConnectionString("IngestionConnection")
            ?? configuration.GetConnectionString("HangfireConnection")
            ?? throw new InvalidOperationException(
                "No PostgreSQL connection string found. " +
                "Add 'IngestionConnection' (or 'HangfireConnection') to ConnectionStrings.");

        services.AddDbContext<IngestionDbContext>(options =>
            options.UseNpgsql(connectionString));

        // ── Repositories ──────────────────────────────────────────────────────
        // Scoped — must match the DbContext lifetime
        services.AddScoped<IAudioFileRepository, AudioFileRepository>();

        // ── Storage & Ingestion orchestration ─────────────────────────────────
        services.AddScoped<IAudioStorageService, MinioAudioStorageService>();
        services.AddScoped<IAudioIngestionService, AudioIngestionService>();

        // ── External AI HTTP clients ──────────────────────────────────────────
        services.AddHttpClient(AudioProcessingService.DeepFilterClientName, client =>
        {
            var baseUrl = configuration["AiSettings:DeepFilter:BaseUrl"]
                          ?? "http://localhost:8002";
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromMinutes(3); // large WAV files take time on CPU
        });

        // ── DIARIZER HTTP CLIENT — INACTIVE ───────────────────────────────────
        // Pyannote speaker diarization has been disabled. It requires a dedicated
        // GPU (≥ 8 GB VRAM) to run at any practical speed. On CPU it can take
        // 10–30× real-time, making it unusable for production without a GPU appliance.
        //
        // To re-enable: uncomment the block below, bring back the diarizer service
        // in docker-compose.yml, and un-skip step 3 in AudioPipelineJob.cs.
        // ─────────────────────────────────────────────────────────────────────
        // services.AddHttpClient(AudioProcessingService.DiarizerClientName, client =>
        // {
        //     var baseUrl = configuration["AiSettings:Diarizer:BaseUrl"]
        //                   ?? "http://localhost:8003";
        //     client.BaseAddress = new Uri(baseUrl);
        //     client.Timeout = TimeSpan.FromMinutes(10); // CPU diarization easily exceeds the 100s default
        // });

        // ── AI processing pipeline ────────────────────────────────────────────
        services.AddSingleton<IAudioProcessingService, AudioProcessingService>();
        services.AddTransient<AudioPipelineJob>();

        // ── Background services (order matters — startup runs before listener) ─
        services.AddHostedService<MinioStartupService>();
        services.AddHostedService<MinioEventListenerService>();

        return services;
    }
}
