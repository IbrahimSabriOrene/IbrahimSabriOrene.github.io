using AIHelpCenter.Ingestion.Domain;

namespace AIHelpCenter.Ingestion.Interfaces;

public interface IAudioFileRepository
{
    Task AddAsync(AudioFile audioFile, CancellationToken cancellationToken);
    Task<AudioFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task UpdateAsync(AudioFile audioFile, CancellationToken cancellationToken);
}
