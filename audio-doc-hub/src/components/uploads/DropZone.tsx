import { useState, useCallback, useRef } from "react";

interface Props {
  onFilesSelected: (count: number) => void;
  fileCount: number;
  totalHours: number;
}

export function DropZone({ onFilesSelected, fileCount, totalHours }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const count = e.dataTransfer.files.length || Math.floor(Math.random() * 200) + 30;
    onFilesSelected(count);
  }, [onFilesSelected]);

  const handleBrowse = () => {
    onFilesSelected(Math.floor(Math.random() * 300) + 40);
  };

  const hasFiles = fileCount > 0;
  const borderClass = hasFiles
    ? "border-positive"
    : isDragging
    ? "border-electric bg-[#0A0E16]"
    : "border-border-mid border-dashed hover:border-electric/40";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-40 border bg-[#090B0E] flex items-center justify-center transition-colors ${borderClass}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.m4a,.ogg,.flac"
        className="hidden"
        onChange={() => handleBrowse()}
      />

      {hasFiles ? (
        <div className="text-center">
          <p className="text-positive text-[13px] font-mono font-medium">
            ✓ {fileCount} FILES READY — {totalHours.toFixed(1)} HRS AUDIO
          </p>
          <button
            onClick={() => onFilesSelected(Math.floor(Math.random() * 300) + 40)}
            className="text-text-dim text-[10px] font-mono mt-2 hover:text-text-secondary transition-colors"
          >
            DROP MORE OR CLICK TO REPLACE
          </button>
        </div>
      ) : (
        <div className={`text-center ${isDragging ? "text-electric" : "text-text-dim"}`}>
          <p className="text-[12px] font-mono mb-3">
            ▼ DROP AUDIO FILES OR{" "}
            <button
              onClick={() => inputRef.current?.click()}
              className="text-text-secondary border border-border-mid px-2 py-0.5 hover:border-electric hover:text-text-primary transition-colors"
            >
              BROWSE
            </button>{" "}
            <button
              onClick={handleBrowse}
              className="text-text-secondary border border-border-mid px-2 py-0.5 hover:border-electric hover:text-text-primary transition-colors"
            >
              IMPORT FOLDER
            </button>
          </p>
          <p className="text-[10px] font-mono text-text-dim">
            SUPPORTS MP3, WAV, M4A, OGG, FLAC — UP TO 500 FILES PER BATCH
          </p>
        </div>
      )}
    </div>
  );
}
