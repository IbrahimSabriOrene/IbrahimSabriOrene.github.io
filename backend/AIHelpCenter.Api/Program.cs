using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using AIHelpCenter.Shared.Interfaces;
using AIHelpCenter.Api.Services;
using AIHelpCenter.Api.Middleware;
using AIHelpCenter.Ingestion;
using Hangfire;
using Hangfire.PostgreSql;
using AIHelpCenter.Ingestion.Application.Jobs;
using AIHelpCenter.Intelligence.Application.Commands.Chat;
using AIHelpCenter.Knowledge.Application.Commands.ExtractKnowledge;
using AIHelpCenter.Intelligence;
var builder = WebApplication.CreateBuilder(args);

// Raise limits for audio file uploads (WAV files can be large)
const long MaxAudioUploadBytes = 500L * 1024 * 1024; // 500 MB

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = MaxAudioUploadBytes;
});

builder.Services.AddControllers();
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = MaxAudioUploadBytes;
    options.ValueLengthLimit = int.MaxValue;
});

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "AI Help Center API";
        document.Info.Version = "v1";
        document.Info.Description = "API for the AI Help Center project, providing audio processing, intelligence, and knowledge management.";
        return Task.CompletedTask;
    });
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// Modules
builder.Services.AddIntelligenceModule();
builder.Services.AddIngestionModule(builder.Configuration);

// MediatR - Register from all modules
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblies(
        typeof(Program).Assembly,
        typeof(AudioPipelineJob).Assembly,
        typeof(ChatCommand).Assembly,
        typeof(ExtractKnowledgeCommand).Assembly
    );
});

// Tenant Provider
builder.Services.AddScoped<ITenantProvider, HttpTenantProvider>();

// Hangfire with PostgreSQL — use non-obsolete lambda overload
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(c =>
        c.UseNpgsqlConnection(builder.Configuration.GetConnectionString("HangfireConnection"))));

// General-purpose server (non-GPU jobs)
builder.Services.AddHangfireServer(options =>
{
    options.ServerName = "general";
    options.Queues = new[] { "default" };
});

// GPU singleton server — processes ONE job at a time to prevent CUDA OOM
builder.Services.AddHangfireServer(options =>
{
    options.ServerName = "gpu-worker";
    options.Queues = new[] { "gpu-fast", "gpu-batch" };
    options.WorkerCount = 1;
});

var app = builder.Build();

// Apply EF Core migrations for the Ingestion module on startup
using (var scope = app.Services.CreateScope())
{
    var ingestionDb = scope.ServiceProvider
        .GetRequiredService<AIHelpCenter.Ingestion.Infrastructure.Persistence.IngestionDbContext>();
    await ingestionDb.Database.MigrateAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Custom Middleware
app.UseMiddleware<TenantMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();
