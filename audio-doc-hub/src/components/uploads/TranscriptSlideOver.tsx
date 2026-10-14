import { X, FileText, Download, Copy } from "lucide-react";
import type { TranscriptionResult } from "@/lib/uploads-mock-data";
import { formatDuration } from "@/lib/uploads-mock-data";
import { useToast } from "@/hooks/use-toast";

interface Props {
  result: TranscriptionResult;
  onClose: () => void;
}

export function TranscriptSlideOver({ result, onClose }: Props) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(result.transcript);
    toast({ title: "Copied to clipboard" });
  };

  const handleExport = (format: string) => {
    toast({ title: `Exported as .${format}`, description: `${result.callId}_transcript.${format}` });
  };

  const lines = (result.transcript || "").split("\n");
  const confColor = (result.confidenceScore ?? 0) >= 90 ? "text-electric" : (result.confidenceScore ?? 0) >= 80 ? "text-warn" : "text-critical";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[320px] h-full bg-[#090B0E] border-l border-border-dim flex flex-col overflow-hidden msg-animate">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
          <span className="text-text-primary text-xs font-mono">{result.callId} — TRANSCRIPT</span>
          <button onClick={onClose} className="text-text-dim hover:text-text-secondary transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Intel Summary */}
        <div className="px-4 py-3 border-b border-border-dim">
          <p className="section-label mb-2">INTEL SUMMARY</p>
          {(result.intelSummary || []).map((s, i) => (
            <div key={i} className="flex gap-2 text-[12px] font-mono text-[#8A95A0] mb-1">
              <span className="text-text-dim flex-shrink-0">·</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="px-4 py-3 border-b border-border-dim grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div>
            <p className="text-text-dim">REP</p>
            <p className="text-text-secondary">{result.rep}</p>
          </div>
          <div>
            <p className="text-text-dim">CLIENT</p>
            <p className="text-text-secondary">{result.client}</p>
          </div>
          <div>
            <p className="text-text-dim">TYPE</p>
            <p className="text-text-secondary">{result.callType}</p>
          </div>
          <div>
            <p className="text-text-dim">DATE</p>
            <p className="text-text-secondary">{result.date}</p>
          </div>
          <div>
            <p className="text-text-dim">DURATION</p>
            <p className="text-text-secondary">{formatDuration(result.duration)}</p>
          </div>
          <div>
            <p className="text-text-dim">CONFIDENCE</p>
            <p className={confColor}>{result.confidenceScore.toFixed(1)}%</p>
          </div>
        </div>

        {/* Transcript body */}
        <div className="flex-1 overflow-y-auto scroll-thin px-4 py-3">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2 py-0.5 hover:bg-bg-raised transition-colors text-[11px] font-mono">
              <span className="text-text-dim w-6 text-right flex-shrink-0 select-none tabular-nums">
                {String(i + 1).padStart(3, "0")}
              </span>
              <span className="text-text-secondary">{line}</span>
            </div>
          ))}
        </div>

        {/* Signal tags */}
        <div className="px-4 py-2 border-t border-border-dim">
          <div className="flex flex-wrap gap-1">
            {(result.signalTags || []).map((t) => (
              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 border border-border-dim text-text-secondary">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Export bar */}
        <div className="px-4 py-2 border-t border-border-dim flex items-center gap-1.5">
          <button onClick={() => handleExport("txt")}
            className="px-2 py-1 text-[9px] font-mono text-text-dim border border-border-dim hover:border-border-mid hover:text-text-secondary transition-colors">
            .TXT
          </button>
          <button onClick={() => handleExport("json")}
            className="px-2 py-1 text-[9px] font-mono text-text-dim border border-border-dim hover:border-border-mid hover:text-text-secondary transition-colors">
            .JSON
          </button>
          <button onClick={() => handleExport("srt")}
            className="px-2 py-1 text-[9px] font-mono text-text-dim border border-border-dim hover:border-border-mid hover:text-text-secondary transition-colors">
            .SRT
          </button>
          <button onClick={handleCopy}
            className="ml-auto px-2 py-1 text-[9px] font-mono text-text-dim border border-border-dim hover:border-border-mid hover:text-text-secondary transition-colors flex items-center gap-1">
            <Copy size={9} /> COPY
          </button>
        </div>
      </div>
    </div>
  );
}
