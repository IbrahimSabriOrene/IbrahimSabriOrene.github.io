// © AIHelpCenter | Author: Developer | Created: 2026-04-18

namespace AIHelpCenter.Ingestion.Models;

/// <summary>
/// Transport object that carries a single raw audio upload.
/// Decouples the Ingestion layer from ASP.NET IFormFile.
/// </summary>
/// <param name="FileName">The original file name of the audio file.</param>
/// <param name="ContentType">The MIME content type of the audio file (e.g. audio/wav).</param>
/// <param name="Data">The raw audio byte stream. The caller is responsible for disposal.</param>
/// <param name="Size">The total size of the audio stream in bytes.</param>
public sealed record AudioUploadItem(
    string FileName,
    string ContentType,
    Stream Data,
    long Size);
