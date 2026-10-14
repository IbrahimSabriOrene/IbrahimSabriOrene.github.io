using AIHelpCenter.Ingestion.Domain;
using AIHelpCenter.Ingestion.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AIHelpCenter.Ingestion.Infrastructure.Persistence;

public class AudioFileRepository : IAudioFileRepository
{
    private readonly IngestionDbContext _context;

    public AudioFileRepository(IngestionDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AudioFile audioFile, CancellationToken cancellationToken)
    {
        await _context.AudioFiles.AddAsync(audioFile, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<AudioFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.AudioFiles.FindAsync([id], cancellationToken);
    }

    public async Task UpdateAsync(AudioFile audioFile, CancellationToken cancellationToken)
    {
        // If the entity was loaded in the same DbContext scope, change tracking
        // handles dirty detection automatically. If it arrived detached, mark it modified.
        if (_context.Entry(audioFile).State == EntityState.Detached)
            _context.AudioFiles.Update(audioFile);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
