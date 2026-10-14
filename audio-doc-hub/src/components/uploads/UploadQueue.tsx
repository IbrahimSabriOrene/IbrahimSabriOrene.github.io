import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { UploadFile } from "@/lib/uploads-mock-data";
import { formatDuration, formatFileSize, REPS, CALL_TYPES } from "@/lib/uploads-mock-data";

interface Props {
  files: UploadFile[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onAssignRep: (rep: string) => void;
  onAssignCallType: (type: string) => void;
  onRemoveSelected: () => void;
  onStartTranscription: () => void;
  onRetry: (id: string) => void;
  onChangeRep: (id: string, rep: string) => void;
  onChangeCallType: (id: string, type: string) => void;
  totalHours: number;
  batchProgress: { complete: number; total: number; percent: number; etaSeconds: number } | null;
  showConfirm: boolean;
  onConfirm: () => void;
  onCancelConfirm: () => void;
}

// Transcribing animation
function TranscribingCell() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setFrame((f) => (f + 1) % 3), 300);
    return () => clearInterval(i);
  }, []);
  const chars = ["░▒▓", "▓░▒", "▒▓░"];
  return <span className="text-electric text-[11px] font-mono">{chars[frame]} PROCESSING</span>;
}

// Upload progress with mono chars
function UploadingCell({ progress }: { progress: number }) {
  const filled = Math.round(progress / 10);
  const bar = "▓".repeat(filled) + "░".repeat(10 - filled);
  return <span className="text-electric text-[11px] font-mono">{bar} {progress}%</span>;
}

function InlineSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent border border-border-dim h-7 px-2 pr-5 text-[11px] text-text-secondary font-mono cursor-pointer hover:border-border-mid focus:outline-none focus:border-electric transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg-raised text-text-primary">{o}</option>
        ))}
      </select>
      <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
    </div>
  );
}

export function UploadQueue({
  files, selected, onToggleSelect, onSelectAll, onAssignRep,
  onAssignCallType, onRemoveSelected, onStartTranscription, onRetry,
  onChangeRep, onChangeCallType, totalHours, batchProgress,
  showConfirm, onConfirm, onCancelConfirm,
}: Props) {
  const [bulkRepOpen, setBulkRepOpen] = useState(false);
  const [bulkTypeOpen, setBulkTypeOpen] = useState(false);

  const allSelected = files.length > 0 && selected.size === files.length;
  const pendingErrors = files.filter(f => f.status === "error").length;
  const estMins = Math.round(files.length * 0.47);

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between mb-0">
        <h2 className="section-label">
          QUEUE — {files.length} FILES · {totalHours.toFixed(1)} HRS · EST. TRANSCRIPTION {estMins} MINS
        </h2>
      </div>
      <div className="border-b border-border-dim mb-3 mt-1" />

      {/* Confirm bar */}
      {showConfirm && (
        <div className="border border-electric/30 bg-electric/5 px-4 py-2.5 mb-3 flex items-center justify-between msg-animate">
          <span className="text-text-primary text-[11px] font-mono">
            CONFIRM: TRANSCRIBE {files.length} FILES? EST. {estMins} MINS · ~${(files.length * 0.10).toFixed(2)} WHISPER COST
          </span>
          <div className="flex gap-2">
            <button onClick={onCancelConfirm} className="px-3 py-1 text-[10px] font-mono text-text-secondary border border-border-mid hover:text-text-primary transition-colors">
              CANCEL
            </button>
            <button onClick={onConfirm} className="px-3 py-1 text-[10px] font-mono text-bg-base bg-electric hover:bg-electric/90 transition-colors">
              CONFIRM ▶
            </button>
          </div>
        </div>
      )}

      {/* Batch progress */}
      {batchProgress && batchProgress.total > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-border-dim mb-2">
            <div className="h-full bg-electric transition-all duration-500" style={{ width: `${batchProgress.percent}%` }} />
          </div>
          <p className="text-[10px] font-mono text-text-secondary">
            TRANSCRIBING {batchProgress.complete} / {batchProgress.total} · {batchProgress.percent}% · ETA {Math.floor(batchProgress.etaSeconds / 60)} MINS {batchProgress.etaSeconds % 60} SECS
          </p>
        </div>
      )}

      {/* Bulk actions bar */}
      <div className="flex items-center gap-3 flex-wrap mb-2 px-3 py-2 bg-bg-surface border border-border-dim text-[10px] font-mono">
        <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary">
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-3 h-3 accent-electric" />
          SELECT ALL
        </label>

        <span className="text-text-dim">|</span>
        <span className="text-text-dim">ASSIGN:</span>

        <div className="relative">
          <button onClick={() => { setBulkRepOpen(!bulkRepOpen); setBulkTypeOpen(false); }}
            className="text-text-secondary border border-border-dim px-2 py-0.5 hover:border-border-mid transition-colors">
            REP ▾
          </button>
          {bulkRepOpen && (
            <div className="absolute z-20 top-full mt-1 bg-bg-raised border border-border-dim py-1 w-36">
              {REPS.map((r) => (
                <button key={r} onClick={() => { onAssignRep(r); setBulkRepOpen(false); }}
                  className="w-full text-left px-3 py-1 text-[10px] text-text-secondary hover:bg-bg-surface font-mono">{r}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setBulkTypeOpen(!bulkTypeOpen); setBulkRepOpen(false); }}
            className="text-text-secondary border border-border-dim px-2 py-0.5 hover:border-border-mid transition-colors">
            TYPE ▾
          </button>
          {bulkTypeOpen && (
            <div className="absolute z-20 top-full mt-1 bg-bg-raised border border-border-dim py-1 w-40">
              {CALL_TYPES.map((t) => (
                <button key={t} onClick={() => { onAssignCallType(t); setBulkTypeOpen(false); }}
                  className="w-full text-left px-3 py-1 text-[10px] text-text-secondary hover:bg-bg-surface font-mono">{t}</button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onRemoveSelected} disabled={selected.size === 0}
          className="text-critical/70 hover:text-critical disabled:opacity-30 disabled:cursor-not-allowed px-2 py-0.5 border border-border-dim transition-colors">
          ✕ REMOVE SELECTED
        </button>

        <div className="flex-1" />

        {selected.size > 0 && (
          <span className="text-text-dim">{selected.size} SELECTED{pendingErrors > 0 ? ` · ${pendingErrors} ERRORS` : ""}</span>
        )}

        <button onClick={onStartTranscription} disabled={files.length === 0}
          className="px-3 py-1 text-[10px] font-mono text-bg-base bg-electric hover:bg-electric/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ▶ START TRANSCRIPTION
        </button>
      </div>

      {/* File table */}
      <div className="border border-border-dim overflow-hidden max-h-[380px] overflow-y-auto scroll-thin">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 bg-bg-surface border-b border-border-dim z-10">
            <tr className="text-text-dim tracking-[0.08em]">
              <th className="w-8 px-2 py-2"></th>
              <th className="text-left px-2 py-2 w-8">#</th>
              <th className="text-left px-2 py-2">FILENAME</th>
              <th className="text-right px-2 py-2 w-16">SIZE</th>
              <th className="text-right px-2 py-2 w-16">DURATION</th>
              <th className="text-left px-2 py-2">REP</th>
              <th className="text-left px-2 py-2">CALL TYPE</th>
              <th className="text-left px-2 py-2 w-20">DATE</th>
              <th className="text-left px-2 py-2 w-[140px]">STATUS</th>
              <th className="text-left px-2 py-2 w-14">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={file.id}
                className={`border-b border-border-dim hover:bg-bg-raised transition-colors h-11 ${
                  idx % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                }`}
              >
                <td className="px-2">
                  <input type="checkbox" checked={selected.has(file.id)} onChange={() => onToggleSelect(file.id)} className="w-3 h-3 accent-electric" />
                </td>
                <td className="px-2 text-text-dim">{idx + 1}</td>
                <td className="px-2 text-text-secondary truncate max-w-[200px]" title={file.filename}>{file.filename}</td>
                <td className="px-2 text-right text-text-dim">{formatFileSize(file.size)}</td>
                <td className="px-2 text-right text-text-dim tabular-nums">{formatDuration(file.duration)}</td>
                <td className="px-2">
                  <InlineSelect value={file.rep} options={REPS} onChange={(v) => onChangeRep(file.id, v)} />
                </td>
                <td className="px-2">
                  <InlineSelect value={file.callType} options={CALL_TYPES} onChange={(v) => onChangeCallType(file.id, v)} />
                </td>
                <td className="px-2 text-text-dim">{file.callDate.slice(5)}</td>
                <td className="px-2">
                  {file.status === "pending" && <span className="text-text-dim">——</span>}
                  {file.status === "uploading" && <UploadingCell progress={file.progress} />}
                  {file.status === "queued" && <span className="text-text-dim">QUEUED</span>}
                  {file.status === "transcribing" && <TranscribingCell />}
                  {file.status === "complete" && <span className="text-positive">✓ DONE</span>}
                  {file.status === "error" && (
                    <button onClick={() => onRetry(file.id)} className="text-critical flex items-center gap-1 hover:underline">
                      ✕ RETRY <RotateCcw size={10} />
                    </button>
                  )}
                </td>
                <td className="px-2">
                  {file.status === "error" && (
                    <button onClick={() => onRetry(file.id)} className="text-text-dim hover:text-text-secondary">
                      <RotateCcw size={11} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
