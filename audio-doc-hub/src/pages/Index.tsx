import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Download, MessageSquare, RotateCcw } from "lucide-react";

// --- Count-up hook ---
function useCountUp(target: number, duration = 800, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((target * ease).toFixed(decimals)));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration, decimals]);
  return value;
}

// --- Mock data ---
const CALL_TYPES = ["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"] as const;
type CallType = typeof CALL_TYPES[number];
const CALL_TYPE_COLORS: Record<CallType, string> = {
  DEMO: "bg-electric/15 text-electric border-electric/20",
  ONBOARDING: "bg-positive/15 text-positive border-positive/20",
  SUPPORT: "bg-text-dim/15 text-text-secondary border-border-mid",
  "ACCOUNT REVIEW": "bg-[#7C3AED]/15 text-[#A78BFA] border-[#7C3AED]/20",
  QBR: "bg-warn/15 text-warn border-warn/20",
};

const STATUS_MAP = {
  COMPLETE: { color: "text-positive", char: "✓" },
  TRANSCRIBING: { color: "text-electric", char: "" },
  QUEUED: { color: "text-text-dim", char: "" },
  FAILED: { color: "text-critical", char: "" },
} as const;
type Status = keyof typeof STATUS_MAP;

const REPS = [
  { initials: "SC", name: "Sarah Chen" },
  { initials: "MR", name: "Mike Rivera" },
  { initials: "JW", name: "Jenna Walsh" },
  { initials: "DK", name: "David Kim" },
  { initials: "LP", name: "Lisa Park" },
  { initials: "TN", name: "Tom Nguyen" },
];

const CLIENTS = [
  { company: "Mercy Health System", contact: "Dr. James Liu" },
  { company: "Kaiser Permanente", contact: "Rachel Torres" },
  { company: "HCA Healthcare", contact: "Mark Sullivan" },
  { company: "Cleveland Clinic", contact: "Anita Patel" },
  { company: "Mayo Clinic", contact: "Steven Wright" },
  { company: "Cedars-Sinai", contact: "Diana Reyes" },
  { company: "Johns Hopkins", contact: "Brian Chen" },
  { company: "Mount Sinai", contact: "Karen Foster" },
];

let callCounter = 1247;
function makeCall(status?: Status) {
  callCounter++;
  const rep = REPS[Math.floor(Math.random() * REPS.length)];
  const client = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
  const callType = CALL_TYPES[Math.floor(Math.random() * CALL_TYPES.length)];
  const dur = Math.floor(Math.random() * 3600) + 120;
  const s = status || (["COMPLETE", "COMPLETE", "COMPLETE", "TRANSCRIBING", "QUEUED"] as Status[])[Math.floor(Math.random() * 5)];
  return {
    id: `CALL-${callCounter}`,
    client,
    callType,
    rep,
    duration: dur,
    status: s,
    isNew: false,
  };
}

const initialCalls = Array.from({ length: 12 }, () => makeCall());

const TOP_REPS = [
  { initials: "SC", name: "Sarah Chen", calls: 54, confidence: 97.1 },
  { initials: "MR", name: "Mike Rivera", calls: 48, confidence: 95.8 },
  { initials: "JW", name: "Jenna Walsh", calls: 41, confidence: 96.4 },
  { initials: "DK", name: "David Kim", calls: 37, confidence: 94.2 },
  { initials: "LP", name: "Lisa Park", calls: 33, confidence: 96.9 },
];

const SIGNAL_TAGS = [
  { label: "FOLLOW-UP REQUIRED", count: 41 },
  { label: "INTEGRATION REQUEST", count: 34 },
  { label: "RENEWAL SIGNAL", count: 22 },
  { label: "COMPETITOR MENTIONED", count: 18 },
  { label: "PRICING OBJECTION", count: 12 },
  { label: "ESCALATION RISK", count: 7 },
];

const PIPELINE = [
  { label: "WHISPER API", pct: 100, value: "NOMINAL" },
  { label: "STORAGE", pct: 67, value: "67% USED" },
  { label: "QUEUE DEPTH", pct: 12, value: "14 JOBS" },
  { label: "ERROR RATE", pct: 3, value: "0.3% (30d)" },
];

// --- Transcribing animation ---
function TranscribingStatus() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setFrame((f) => (f + 1) % 3), 300);
    return () => clearInterval(i);
  }, []);
  const chars = ["░░░", "▒▒▒", "▓▓▓"];
  return <span className="text-electric text-[10px] font-mono">TRANSCRIBING {chars[frame]}</span>;
}

function formatDuration(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function Index() {
  const [calls, setCalls] = useState(initialCalls);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Add new row every 5s
  useEffect(() => {
    const i = setInterval(() => {
      const newCall = makeCall("TRANSCRIBING");
      newCall.isNew = true;
      setCalls((prev) => [newCall, ...prev.slice(0, 19)]);
    }, 5000);
    return () => clearInterval(i);
  }, []);

  const callsToday = useCountUp(247, 800);
  const hoursProcessed = useCountUp(38.4, 800, 1);
  const avgConfidence = useCountUp(96.2, 800, 1);
  const pendingReview = useCountUp(14, 800);

  const filteredCalls = activeTag
    ? calls.filter(() => Math.random() > 0.4) // Mock filter
    : calls;

  return (
    <div className="h-full overflow-auto scroll-thin">
      <div className="p-6">
        {/* KPI ROW */}
        <div className="grid grid-cols-4 gap-px mb-6">
          <KpiCard label="CALLS TODAY" value={callsToday} sub="+12% vs yesterday" subColor="text-positive" />
          <KpiCard label="HOURS PROCESSED" value={hoursProcessed} sub="across 6 reps" />
          <KpiCard
            label="AVG CONFIDENCE"
            value={`${avgConfidence}%`}
            valueColor={avgConfidence > 90 ? "text-electric" : avgConfidence > 80 ? "text-warn" : "text-critical"}
            sub="WHISPER LARGE-V3 · EN-US"
          />
          <KpiCard label="PENDING REVIEW" value={pendingReview} valueColor="text-warn" sub="action items flagged" />
        </div>

        {/* MAIN GRID */}
        <div className="flex gap-px">
          {/* LEFT — CALL FEED */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0">
              <h2 className="section-label">RECENT CALLS</h2>
              {activeTag && (
                <button onClick={() => setActiveTag(null)} className="text-[9px] font-mono text-electric hover:underline">
                  CLEAR FILTER
                </button>
              )}
            </div>
            <div className="border-b border-border-dim mb-2 mt-1" />

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-mono text-text-dim tracking-[0.08em]">
                    <th className="pb-2 pr-3 w-[80px]">CALL ID</th>
                    <th className="pb-2 pr-3">CLIENT</th>
                    <th className="pb-2 pr-3">CALL TYPE</th>
                    <th className="pb-2 pr-3">REP</th>
                    <th className="pb-2 pr-3 text-right w-[60px]">DURATION</th>
                    <th className="pb-2 pr-3 w-[130px]">STATUS</th>
                    <th className="pb-2 w-[80px]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call, i) => (
                    <tr
                      key={call.id + i}
                      className={`border-b border-bg-surface hover:bg-bg-raised transition-colors h-11 ${
                        call.isNew ? "msg-animate" : ""
                      }`}
                    >
                      <td className="pr-3 text-electric text-xs font-mono">{call.id}</td>
                      <td className="pr-3">
                        <div className="text-text-primary text-xs font-mono leading-tight">{call.client.company}</div>
                        <div className="text-text-dim text-[10px] font-mono">{call.client.contact}</div>
                      </td>
                      <td className="pr-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-[0.06em] border ${
                            CALL_TYPE_COLORS[call.callType]
                          }`}
                        >
                          {call.callType}
                        </span>
                      </td>
                      <td className="pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-bg-raised border border-border-dim flex items-center justify-center text-[9px] font-mono text-text-secondary rounded-full flex-shrink-0">
                            {call.rep.initials}
                          </div>
                          <span className="text-text-secondary text-xs font-mono">{call.rep.name}</span>
                        </div>
                      </td>
                      <td className="pr-3 text-right text-text-secondary text-xs font-mono tabular-nums">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="pr-3">
                        {call.status === "COMPLETE" && (
                          <span className="text-positive text-[10px] font-mono">✓ COMPLETE</span>
                        )}
                        {call.status === "TRANSCRIBING" && <TranscribingStatus />}
                        {call.status === "QUEUED" && (
                          <span className="text-text-dim text-[10px] font-mono">QUEUED</span>
                        )}
                        {call.status === "FAILED" && (
                          <span className="text-critical text-[10px] font-mono flex items-center gap-1">
                            FAILED <RotateCcw size={10} />
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              window.location.href = `/calls/${call.id}`;
                            }}
                            title="View call detail"
                            className="text-text-dim hover:text-text-secondary transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const transcript = `Call Record: ${call.id}\nClient: ${call.client.company}\nContact: ${call.client.contact}\nRep: ${call.rep.name}\nType: ${call.callType}\nDuration: ${formatDuration(call.duration)}\nStatus: ${call.status}\n`;
                              const blob = new Blob([transcript], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${call.id}-record.txt`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                            }}
                            title="Export call record"
                            className="text-text-dim hover:text-text-secondary transition-colors"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            onClick={() => {
                              window.location.href = `/chat?callId=${call.id}`;
                            }}
                            title="Open in intelligence"
                            className="text-text-dim hover:text-text-secondary transition-colors"
                          >
                            <MessageSquare size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[340px] flex-shrink-0 ml-4">
            {/* TOP REPS */}
            <div className="border border-border-dim bg-bg-surface p-4 mb-px">
              <h3 className="section-label mb-3">TOP REPS THIS WEEK</h3>
              <div className="space-y-0">
                {TOP_REPS.map((rep, i) => (
                  <div
                    key={rep.initials}
                    className={`flex items-center gap-3 py-2 ${
                      i === 0 ? "border-l-2 border-l-electric pl-3 -ml-4" : ""
                    }`}
                  >
                    <span className="text-text-dim text-[10px] font-mono w-3">{i + 1}</span>
                    <div className="w-6 h-6 bg-bg-raised border border-border-dim flex items-center justify-center text-[9px] font-mono text-text-secondary rounded-full flex-shrink-0">
                      {rep.initials}
                    </div>
                    <span className="text-text-primary text-xs font-mono flex-1">{rep.name}</span>
                    <span className="text-text-secondary text-[10px] font-mono">{rep.calls}</span>
                    <span className="text-electric text-[10px] font-mono">{rep.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIGNAL TAGS */}
            <div className="border border-border-dim border-t-0 bg-bg-surface p-4 mb-px">
              <h3 className="section-label mb-3">SIGNAL TAG BREAKDOWN</h3>
              <div className="space-y-2">
                {SIGNAL_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => setActiveTag(activeTag === tag.label ? null : tag.label)}
                    className={`w-full flex items-center justify-between py-1 text-left transition-colors ${
                      activeTag === tag.label ? "text-electric" : ""
                    }`}
                  >
                    <span className="text-text-secondary text-[10px] font-mono tracking-[0.04em]">{tag.label}</span>
                    <span className="text-electric text-xs font-mono font-medium">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PIPELINE HEALTH */}
            <div className="border border-border-dim border-t-0 bg-bg-surface p-4">
              <h3 className="section-label mb-3">PIPELINE HEALTH</h3>
              <div className="space-y-3">
                {PIPELINE.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-text-dim text-[10px] font-mono w-24 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 h-[2px] bg-border-dim">
                      <div
                        className="h-full bg-electric transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-text-secondary text-[10px] font-mono w-20 text-right flex-shrink-0">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KPI Card ---
function KpiCard({
  label,
  value,
  sub,
  valueColor = "text-text-primary",
  subColor = "text-text-secondary",
}: {
  label: string;
  value: number | string;
  sub: string;
  valueColor?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-bg-surface border border-border-dim px-5 py-4">
      <p className="section-label mb-2">{label}</p>
      <p className={`text-[32px] font-mono font-semibold leading-none ${valueColor}`}>{value}</p>
      <p className={`text-[10px] font-mono mt-1.5 ${subColor}`}>{sub}</p>
    </div>
  );
}
