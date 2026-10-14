import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Eye, Download, FileText } from "lucide-react";
import type { TranscriptionResult } from "@/lib/uploads-mock-data";
import { formatDuration } from "@/lib/uploads-mock-data";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Props {
  results: TranscriptionResult[];
  onViewTranscript: (result: TranscriptionResult) => void;
}

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 90 ? "text-electric" : score >= 80 ? "text-warn" : "text-critical";
  return <span className={`text-[11px] font-mono ${color}`}>{score.toFixed(1)}%</span>;
}

function SignalTag({ tag }: { tag: string }) {
  return (
    <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 border border-border-dim text-text-secondary mr-1 mb-0.5">
      {tag}
    </span>
  );
}

export function TranscriptionResults({ results, onViewTranscript }: Props) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const handleExportAll = () => {
    toast({ title: "Export started", description: `Exporting ${results.length} transcripts...` });
  };

  return (
    <div className="border border-border-dim">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface hover:bg-bg-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={12} className="text-text-dim" /> : <ChevronRight size={12} className="text-text-dim" />}
          <span className="section-label">COMPLETED TRANSCRIPTS — {results.length} DONE</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); handleExportAll(); }}
            className="text-[10px] font-mono text-text-secondary border border-border-dim px-2 py-0.5 hover:border-border-mid transition-colors">
            EXPORT ALL
          </button>
          <Link to="/chat" onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-mono text-electric border border-electric/30 px-2 py-0.5 hover:bg-electric/5 transition-colors">
            VIEW IN INTELLIGENCE
          </Link>
        </div>
      </button>

      {/* Table */}
      {expanded && (
        <div className="overflow-y-auto scroll-thin max-h-[400px]">
          <table className="w-full text-[11px] font-mono">
            <thead className="sticky top-0 bg-bg-surface border-b border-border-dim z-10">
              <tr className="text-text-dim tracking-[0.08em]">
                <th className="text-left px-3 py-2">CALL ID</th>
                <th className="text-left px-3 py-2">REP</th>
                <th className="text-left px-3 py-2">CLIENT</th>
                <th className="text-left px-3 py-2">TYPE</th>
                <th className="text-right px-3 py-2">DURATION</th>
                <th className="text-right px-3 py-2">CONFIDENCE</th>
                <th className="text-left px-3 py-2">SIGNAL TAGS</th>
                <th className="text-right px-3 py-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.id} className={`border-b border-border-dim hover:bg-bg-raised transition-colors ${
                  idx % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                }`}>
                  <td className="px-3 py-2 text-electric">{r.callId}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.rep}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.client}</td>
                  <td className="px-3 py-2 text-text-dim">{r.callType}</td>
                  <td className="px-3 py-2 text-right text-text-dim tabular-nums">{formatDuration(r.duration)}</td>
                  <td className="px-3 py-2 text-right"><ConfidenceBadge score={r.confidenceScore} /></td>
                  <td className="px-3 py-2">
                    {(r.signalTags || []).map((t) => <SignalTag key={t} tag={t} />)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onViewTranscript(r)} className="text-text-dim hover:text-text-secondary p-1 transition-colors" title="View">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => toast({ title: "Exported .txt" })} className="text-text-dim hover:text-text-secondary p-1 transition-colors" title="Export TXT">
                        <FileText size={12} />
                      </button>
                      <button onClick={() => toast({ title: "Exported .json" })} className="text-text-dim hover:text-text-secondary p-1 transition-colors" title="Export JSON">
                        <Download size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
