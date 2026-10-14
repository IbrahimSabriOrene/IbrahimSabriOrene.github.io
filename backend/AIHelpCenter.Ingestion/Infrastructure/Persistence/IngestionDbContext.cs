using AIHelpCenter.Ingestion.Domain;
using Microsoft.EntityFrameworkCore;

namespace AIHelpCenter.Ingestion.Infrastructure.Persistence;

public class IngestionDbContext : DbContext
{
    public DbSet<AudioFile> AudioFiles => Set<AudioFile>();

    public IngestionDbContext(DbContextOptions<IngestionDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("ingestion");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IngestionDbContext).Assembly);
    }
}
