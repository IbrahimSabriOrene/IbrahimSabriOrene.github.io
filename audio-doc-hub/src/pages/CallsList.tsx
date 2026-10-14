import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Eye, Download, MessageSquare, RotateCcw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REPS = ["Sarah Chen", "Mike Rivera", "Jenna Walsh", "David Kim", "Lisa Park", "Tom Nguyen"];
const CALL_TYPES = ["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"];
const STATUSES = ["COMPLETE", "TRANSCRIBING", "QUEUED", "FAILED"];

const TYPE_COLORS: Record<string, string> = {
  DEMO: "bg-electric/15 text-electric border-electric/20",
  ONBOARDING: "bg-positive/15 text-positive border-positive/20",
  SUPPORT: "bg-text-dim/15 text-text-secondary border-border-mid",
  "ACCOUNT REVIEW": "bg-[#7C3AED]/15 text-[#A78BFA] border-[#7C3AED]/20",
  QBR: "bg-warn/15 text-warn border-warn/20",
};

// Generate 1203 mock calls
const ALL_CALLS = Array.from({ length: 1203 }, (_, i) => {
  const r = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const clients = ["Mercy Health", "Kaiser Permanente", "HCA Healthcare", "Cleveland Clinic", "Mayo Clinic", "Cedars-Sinai", "Johns Hopkins", "Mount Sinai", "Banner Health", "Geisinger", "NYU Langone", "UCSF Health"];
  const contacts = ["Dr. James Liu", "Rachel Torres", "Mark Sullivan", "Anita Patel", "Steven Wright", "Diana Reyes", "Brian Chen", "Karen Foster"];
  return {
    id: `CALL-${1000 + i}`,
    client: r(clients),
    contact: r(contacts),
    rep: r(REPS),
    callType: r(CALL_TYPES),
    date: `2026-03-${String(28 - Math.floor(i / 40)).padStart(2, "0")}`,
    duration: Math.floor(Math.random() * 3600) + 120,
    status: r(["COMPLETE", "COMPLETE", "COMPLETE", "COMPLETE", "TRANSCRIBING", "QUEUED"]),
    confidence: +(82 + Math.random() * 17).toFixed(1),
  };
});

function formatDur(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

type SortKey = "id" | "client" | "rep" | "callType" | "date" | "duration" | "status" | "confidence";

export default function CallsList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [repFilter, setRepFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const perPage = 50;

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (typeFilter) activeFilters.push({ label: `TYPE: ${typeFilter}`, clear: () => setTypeFilter("") });
  if (repFilter) activeFilters.push({ label: `REP: ${repFilter}`, clear: () => setRepFilter("") });
  if (statusFilter) activeFilters.push({ label: `STATUS: ${statusFilter}`, clear: () => setStatusFilter("") });

  const filtered = useMemo(() => {
    let data = ALL_CALLS;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c => c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.rep.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q));
    }
    if (typeFilter) data = data.filter(c => c.callType === typeFilter);
    if (repFilter) data = data.filter(c => c.rep === repFilter);
    if (statusFilter) data = data.filter(c => c.status === statusFilter);

    data = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return data;
  }, [search, typeFilter, repFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortHeader = ({ k, children, className = "" }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={`px-3 py-2 cursor-pointer hover:text-text-secondary transition-colors select-none ${className}`} onClick={() => handleSort(k)}>
      <span className="flex items-center gap-1">
        {children}
        {sortKey === k && (sortDir === "asc" ? <ChevronUp size={9} /> : <ChevronDown size={9} />)}
      </span>
    </th>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-border-dim bg-bg-base flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="SEARCH BY CLIENT, REP, KEYWORD..."
              className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-primary placeholder:text-text-dim pl-7 pr-2 focus:outline-none focus:border-electric transition-colors"
            />
          </div>

          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-7 bg-bg-surface border border-border-dim text-[10px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
            <option value="">CALL TYPE ▾</option>
            {CALL_TYPES.map(t => <option key={t} value={t} className="bg-bg-raised">{t}</option>)}
          </select>

          <select value={repFilter} onChange={e => { setRepFilter(e.target.value); setPage(1); }}
            className="h-7 bg-bg-surface border border-border-dim text-[10px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
            <option value="">REP ▾</option>
            {REPS.map(r => <option key={r} value={r} className="bg-bg-raised">{r}</option>)}
          </select>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-7 bg-bg-surface border border-border-dim text-[10px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
            <option value="">STATUS ▾</option>
            {STATUSES.map(s => <option key={s} value={s} className="bg-bg-raised">{s}</option>)}
          </select>

          <div className="flex-1" />
          <span className="text-text-dim text-[10px] font-mono">
            SHOWING {filtered.length} OF {ALL_CALLS.length} CALLS
          </span>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex gap-2 mt-2">
            {activeFilters.map(f => (
              <button key={f.label} onClick={f.clear}
                className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 border border-electric/30 text-electric hover:bg-electric/5 transition-colors">
                {f.label} <X size={8} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scroll-thin">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 bg-bg-surface border-b border-border-dim z-10 text-text-dim tracking-[0.08em]">
            <tr>
              <th className="w-8 px-3 py-2"><input type="checkbox" className="w-3 h-3 accent-electric" onChange={() => {
                if (selected.size === pageData.length) setSelected(new Set());
                else setSelected(new Set(pageData.map(c => c.id)));
              }} checked={selected.size === pageData.length && pageData.length > 0} /></th>
              <SortHeader k="id" className="text-left w-[90px]">CALL ID</SortHeader>
              <SortHeader k="client" className="text-left">CLIENT</SortHeader>
              <SortHeader k="callType" className="text-left">CALL TYPE</SortHeader>
              <SortHeader k="rep" className="text-left">REP</SortHeader>
              <SortHeader k="duration" className="text-right w-[70px]">DURATION</SortHeader>
              <SortHeader k="confidence" className="text-right w-[80px]">CONFIDENCE</SortHeader>
              <SortHeader k="status" className="text-left w-[100px]">STATUS</SortHeader>
              <th className="text-left px-3 py-2 w-[80px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((call, idx) => (
              <tr key={call.id} className={`border-b border-border-dim hover:bg-bg-raised transition-colors h-11 ${
                idx % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
              }`}>
                <td className="px-3">
                  <input type="checkbox" className="w-3 h-3 accent-electric"
                    checked={selected.has(call.id)}
                    onChange={() => {
                      const next = new Set(selected);
                      if (next.has(call.id)) next.delete(call.id); else next.add(call.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td className="px-3">
                  <Link to={`/calls/${call.id}`} className="text-electric hover:underline">{call.id}</Link>
                </td>
                <td className="px-3">
                  <div className="text-text-primary text-xs leading-tight">{call.client}</div>
                  <div className="text-text-dim text-[10px]">{call.contact}</div>
                </td>
                <td className="px-3">
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] tracking-[0.06em] border ${TYPE_COLORS[call.callType] || ""}`}>
                    {call.callType}
                  </span>
                </td>
                <td className="px-3 text-text-secondary">{call.rep}</td>
                <td className="px-3 text-right text-text-dim tabular-nums">{formatDur(call.duration)}</td>
                <td className="px-3 text-right">
                  <span className={call.confidence >= 90 ? "text-electric" : call.confidence >= 80 ? "text-warn" : "text-critical"}>
                    {call.confidence}%
                  </span>
                </td>
                <td className="px-3">
                  {call.status === "COMPLETE" && <span className="text-positive">✓ COMPLETE</span>}
                  {call.status === "TRANSCRIBING" && <span className="text-electric">TRANSCRIBING</span>}
                  {call.status === "QUEUED" && <span className="text-text-dim">QUEUED</span>}
                  {call.status === "FAILED" && <span className="text-critical">✕ FAILED</span>}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-1">
                    <Link to={`/calls/${call.id}`} className="text-text-dim hover:text-text-secondary p-0.5" title="View call detail"><Eye size={12} /></Link>
                    <button
                      className="text-text-dim hover:text-text-secondary p-0.5"
                      title="Export transcript"
                      onClick={() => {
                        const content = `Call Record: ${call.id}\nClient: ${call.client}\nContact: ${call.contact}\nRep: ${call.rep}\nCall Type: ${call.callType}\nDate: ${call.date}\nDuration: ${formatDur(call.duration)}\nStatus: ${call.status}\nConfidence: ${call.confidence}%\n`;
                        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${call.id}-record.txt`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={12} />
                    </button>
                    <Link to={`/intelligence?callId=${call.id}`} className="text-text-dim hover:text-text-secondary p-0.5" title="Ask Intel about this call"><MessageSquare size={12} /></Link>
                    {call.status === "FAILED" && (
                      <button className="text-text-dim hover:text-critical p-0.5" title="Retry transcription"
                        onClick={() => toast({ title: "RETRY QUEUED", description: `${call.id} re-queued for transcription.` })}>
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageData.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-text-dim text-xs font-mono">NO CALLS FOUND</p>
            <p className="text-text-dim text-[10px] font-mono mt-1">ADJUST FILTERS TO SEE RESULTS</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-2 border-t border-border-dim bg-bg-base flex items-center justify-between flex-shrink-0">
          <span className="text-text-dim text-[10px] font-mono">
            {selected.size > 0 && `${selected.size} SELECTED · `}PAGE {page} OF {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-2 py-1 text-[10px] font-mono text-text-dim border border-border-dim hover:border-border-mid disabled:opacity-30 transition-colors">&lt;</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2 py-1 text-[10px] font-mono border transition-colors ${
                    p === page ? "text-electric border-electric" : "text-text-dim border-border-dim hover:border-border-mid"
                  }`}>{p}</button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && <span className="text-text-dim text-[10px] font-mono px-1">...</span>}
            {totalPages > 5 && page < totalPages - 2 && (
              <button onClick={() => setPage(totalPages)}
                className="px-2 py-1 text-[10px] font-mono text-text-dim border border-border-dim hover:border-border-mid transition-colors">{totalPages}</button>
            )}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-2 py-1 text-[10px] font-mono text-text-dim border border-border-dim hover:border-border-mid disabled:opacity-30 transition-colors">&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}
