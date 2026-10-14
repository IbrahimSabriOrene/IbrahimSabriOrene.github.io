using AIHelpCenter.Ingestion.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIHelpCenter.Ingestion.Infrastructure.Persistence.Configurations;

public class AudioFileConfiguration : IEntityTypeConfiguration<AudioFile>
{
    public void Configure(EntityTypeBuilder<AudioFile> builder)
    {
        builder.ToTable("audio_files");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.FileName)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.FileSize).IsRequired();

        builder.Property(x => x.StoragePath)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.TenantId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.CleanStoragePath)
            .HasMaxLength(1000);

        builder.Property(x => x.DiarizationJson)
            .HasColumnType("text");

        builder.Property(x => x.Transcription)
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAtUtc);
    }
}
