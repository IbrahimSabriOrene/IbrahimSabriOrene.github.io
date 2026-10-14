import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Download, Share2, Flag, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock call data
const MOCK_CALLS_DB = Array.from({ length: 50 }, (_, i) => {
  const reps = ["Sarah Chen", "Mike Rivera", "Jenna Walsh", "David Kim", "Lisa Park", "Tom Nguyen"];
  const clients = [
    { company: "Northwell Health", contact: "Dr. James Osei" },
    { company: "Mercy Health", contact: "Rachel Torres" },
    { company: "Kaiser Permanente", contact: "Mark Sullivan" },
    { company: "HCA Healthcare", contact: "Anita Patel" },
    { company: "Cleveland Clinic", contact: "Steven Wright" },
    { company: "Mayo Clinic", contact: "Diana Reyes" },
  ];
  const types = ["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"];
  const statuses = ["COMPLETE", "COMPLETE", "COMPLETE", "TRANSCRIBING", "QUEUED"];
  const tags = ["COMPETITOR MENTIONED", "PRICING OBJECTION", "INTEGRATION REQUEST", "FOLLOW-UP REQUIRED", "RENEWAL SIGNAL", "ESCALATION RISK"];

  const r = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const client = r(clients);
  const numTags = 1 + Math.floor(Math.random() * 3);
  const callTags: string[] = [];
  for (let t = 0; t < numTags; t++) callTags.push(r(tags));

  return {
    id: `CALL-${4800 + i}`,
    client: client.company,
    contact: client.contact,
    rep: r(reps),
    callType: r(types),
    date: `2026-03-${String(28 - Math.floor(i / 5)).padStart(2, "0")}`,
    duration: Math.floor(Math.random() * 3000) + 300,
    status: r(statuses),
    confidence: +(82 + Math.random() * 17).toFixed(1),
    model: "WHISPER LARGE-V3",
    words: Math.floor(Math.random() * 5000) + 1500,
    speakers: 2,
    fileInfo: "Zoom · MP3 · 18.4 MB",
    signalTags: [...new Set(callTags)],
    intelSummary: [
      "Client expressed strong interest in enterprise analytics tier — requesting custom proposal",
      "Competitor Nuance mentioned as current vendor, cited high operational costs and limited API access",
      "Follow-up scheduled for next Tuesday to demo the Epic EHR integration workflow",
    ],
    actionItems: [
      { text: "Send custom pricing proposal for enterprise tier", owner: "REP" },
      { text: "Schedule Epic integration demo with technical team", owner: "REP" },
      { text: "Review competitor comparison docs before follow-up", owner: "REP" },
      { text: "Provide list of required API endpoints for integration", owner: "CLT" },
      { text: "Confirm board meeting date for budget approval", owner: "CLT" },
    ],
    transcript: generateTranscript(),
  };
});

function generateTranscript() {
  const exchanges = [
    { time: "00:00:12", speaker: "REP", text: "Thanks for jumping on, appreciate you making time today. I wanted to walk through the Q3 reporting workflow that we've been preparing specifically for your team." },
    { time: "00:00:42", speaker: "CLT", text: "Great, yes — we've been looking forward to this. Our board review is coming up in September so timing is critical for us." },
    { time: "00:01:18", speaker: "REP", text: "Understood. Let me start by showing you the real-time transcription dashboard. Everything you see here is processing through Whisper Large-V3 with speaker diarization enabled." },
    { time: "00:02:05", speaker: "CLT", text: "We're going to need Epic integration complete before our September board review. That's non-negotiable for us." },
    { time: "00:02:38", speaker: "REP", text: "The Epic connector is shipping in our August release. That should give you 6 weeks of runway before September. We can actually start the pilot integration now if you'd like." },
    { time: "00:03:15", speaker: "CLT", text: "That would be ideal. Right now we're using Nuance for transcription and honestly the costs are getting out of hand. The analytics are also very limited." },
    { time: "00:03:52", speaker: "REP", text: "I hear that a lot from teams transitioning from Nuance. Our pricing model is usage-based which typically saves organizations 40-60% compared to seat-based licensing." },
    { time: "00:04:30", speaker: "CLT", text: "What about accuracy? Our physicians are very particular about transcription quality, especially in specialized terminology." },
    { time: "00:05:08", speaker: "REP", text: "Great question. We're seeing 96-98% accuracy on medical terminology with the latest model. I can pull up some sample comparisons if that would be helpful." },
    { time: "00:05:45", speaker: "CLT", text: "Yes please. And can you also send over a formal proposal? We need to present budget numbers to the executive committee." },
    { time: "00:06:22", speaker: "REP", text: "Absolutely. I'll have a custom proposal over to you by end of week with pricing tiers, implementation timeline, and ROI projections based on your team size." },
    { time: "00:06:58", speaker: "CLT", text: "Perfect. One more thing — we'd want to pilot this in cardiology and emergency departments first before rolling out hospital-wide." },
    { time: "00:07:35", speaker: "REP", text: "That's actually our recommended approach. We typically see the strongest adoption when starting with 2-3 departments and expanding from there." },
    { time: "00:08:10", speaker: "CLT", text: "Sounds like a plan. Let's schedule a follow-up next week to go over the proposal details." },
    { time: "00:08:42", speaker: "REP", text: "Will do. I'll send a calendar invite for Tuesday at the same time. Thanks again for your time today — this is going to be a great fit." },
  ];
  return exchanges;
}

function formatDur(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const RISK_KEYWORDS = ["nuance", "cost", "budget", "competitor", "expensive", "pricing", "non-negotiable", "escalat"];
const POSITIVE_KEYWORDS = ["interest", "pilot", "proposal", "great fit", "ideal", "impressed", "recommend", "savings"];

function highlightLine(text: string) {
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;

  const allKw = [
    ...RISK_KEYWORDS.map(k => ({ kw: k, type: "risk" as const })),
    ...POSITIVE_KEYWORDS.map(k => ({ kw: k, type: "positive" as const })),
  ];

  // Simple highlight — find first match
  for (const { kw, type } of allKw) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      const bg = type === "positive" ? "bg-[#1A2A1A] text-positive" : "bg-[#2A1A1A] text-warn";
      return (
        <span>
          {text.slice(0, idx)}
          <span className={`${bg} px-0.5`}>{text.slice(idx, idx + kw.length)}</span>
          {text.slice(idx + kw.length)}
        </span>
      );
    }
  }
  return <span>{text}</span>;
}

export default function CallDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState<"ALL" | "REP" | "CLT">("ALL");
  const [askInput, setAskInput] = useState("");

  const call = MOCK_CALLS_DB.find(c => c.id === id) || MOCK_CALLS_DB[0];
  const displayId = id || call.id;

  const filteredTranscript = call.transcript.filter(line => {
    if (speakerFilter !== "ALL" && line.speaker !== speakerFilter) return false;
    if (searchQuery && !line.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const relatedCalls = MOCK_CALLS_DB.filter(c => c.id !== call.id && (c.client === call.client || c.rep === call.rep)).slice(0, 3);
  const confColor = call.confidence >= 90 ? "text-electric" : call.confidence >= 80 ? "text-warn" : "text-critical";

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT — Metadata */}
      <div className="w-[220px] flex-shrink-0 border-r border-border-dim bg-[#090B0E] flex flex-col overflow-y-auto scroll-thin">
        <div className="p-4">
          <p className="text-electric text-lg font-mono font-semibold mb-1">{displayId}</p>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
            call.status === "COMPLETE" ? "text-positive border-positive/30" : "text-electric border-electric/30"
          }`}>
            {call.status}
          </span>

          <div className="text-border-mid text-[10px] font-mono my-3 select-none">———————————————</div>

          {[
            { label: "CLIENT", value: call.client },
            { label: "CONTACT", value: call.contact },
            { label: "REP", value: call.rep },
            { label: "TYPE", value: call.callType },
            { label: "DATE", value: call.date },
            { label: "DURATION", value: formatDur(call.duration) },
            { label: "RECORDED", value: call.fileInfo },
          ].map(row => (
            <div key={row.label} className="mb-2">
              <p className="text-text-dim text-[9px] font-mono tracking-[0.08em]">{row.label}</p>
              <p className="text-text-secondary text-[11px] font-mono">{row.value}</p>
            </div>
          ))}

          <div className="text-border-mid text-[10px] font-mono my-3 select-none">——————</div>

          {[
            { label: "CONFIDENCE", value: `${call.confidence}%`, color: confColor },
            { label: "MODEL", value: call.model, color: "text-text-secondary" },
            { label: "WORDS", value: call.words.toLocaleString(), color: "text-text-secondary" },
            { label: "SPEAKERS", value: `${call.speakers} DETECTED`, color: "text-text-secondary" },
          ].map(row => (
            <div key={row.label} className="mb-2">
              <p className="text-text-dim text-[9px] font-mono tracking-[0.08em]">{row.label}</p>
              <p className={`text-[11px] font-mono ${row.color}`}>{row.value}</p>
            </div>
          ))}

          {/* Signal Tags */}
          <div className="mt-4">
            <p className="section-label mb-2">SIGNAL TAGS</p>
            <div className="space-y-1">
              {call.signalTags.map(tag => (
                <span key={tag} className="block text-[9px] font-mono px-1.5 py-0.5 border border-border-dim text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto p-4 border-t border-border-dim space-y-1.5">
          {[
            { icon: "▶", label: "PLAY AUDIO", action: () => toast({ title: "Audio playback started" }) },
            { icon: "↓", label: "EXPORT TRANSCRIPT", action: () => toast({ title: "Transcript exported" }) },
            { icon: "✉", label: "SHARE", action: () => toast({ title: "Share link copied" }) },
            { icon: "⚑", label: "FLAG FOR REVIEW", action: () => toast({ title: "Flagged for review" }) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className="w-full text-left px-2 py-1.5 text-[10px] font-mono text-text-dim hover:text-text-secondary hover:bg-bg-raised transition-colors">
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER — Transcript */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-5 h-9 border-b border-border-dim bg-bg-base flex-shrink-0">
          <span className="section-label">TRANSCRIPT</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0">
              {(["ALL", "REP", "CLT"] as const).map(f => (
                <button key={f} onClick={() => setSpeakerFilter(f)}
                  className={`px-2 py-0.5 text-[9px] font-mono border border-border-dim transition-colors ${
                    speakerFilter === f ? "text-electric bg-electric/5 border-electric/30" : "text-text-dim hover:text-text-secondary"
                  }`}>
                  {f === "ALL" ? "ALL" : f === "REP" ? "REP ONLY" : "CLIENT ONLY"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-dim" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH TRANSCRIPT..."
                className="h-6 bg-bg-surface border border-border-dim text-[10px] font-mono text-text-primary placeholder:text-text-dim pl-6 pr-2 w-40 focus:outline-none focus:border-electric transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 bg-bg-base">
          {filteredTranscript.map((line, i) => (
            <div key={i} className="flex gap-3 py-1.5 hover:bg-bg-raised transition-colors group">
              <span className="text-electric text-[10px] font-mono w-14 flex-shrink-0 tabular-nums pt-0.5">{line.time}</span>
              <span className={`text-[10px] font-mono w-8 flex-shrink-0 font-medium pt-0.5 ${
                line.speaker === "REP" ? "text-electric" : "text-[#8A9EFF]"
              }`}>{line.speaker}</span>
              <span className="text-[12px] font-mono text-[#8A95A0] leading-relaxed">
                {highlightLine(line.text)}
              </span>
            </div>
          ))}
          {filteredTranscript.length === 0 && (
            <p className="text-text-dim text-xs font-mono text-center py-8">NO MATCHING LINES</p>
          )}
        </div>
      </div>

      {/* RIGHT — Intelligence */}
      <div className="w-[280px] flex-shrink-0 border-l border-border-dim bg-bg-surface flex flex-col overflow-y-auto scroll-thin">
        {/* Intel Summary */}
        <div className="p-4 border-b border-border-dim">
          <p className="section-label mb-3">INTEL SUMMARY</p>
          {call.intelSummary.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2.5">
              <span className="text-text-dim text-[12px] font-mono flex-shrink-0">·</span>
              <span className="text-[12px] font-mono text-[#8A95A0] leading-relaxed">{s}</span>
            </div>
          ))}
        </div>

        {/* Action Items */}
        <div className="p-4 border-b border-border-dim">
          <p className="section-label mb-3">ACTION ITEMS</p>
          {call.actionItems.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-electric text-[11px] font-mono font-medium flex-shrink-0">{i + 1}</span>
              <span className="text-[11px] font-mono text-text-secondary leading-relaxed flex-1">{item.text}</span>
              <span className={`text-[9px] font-mono px-1 py-0.5 border border-border-dim flex-shrink-0 h-fit ${
                item.owner === "REP" ? "text-electric" : "text-[#8A9EFF]"
              }`}>{item.owner}</span>
            </div>
          ))}
        </div>

        {/* Related Calls */}
        <div className="p-4 border-b border-border-dim">
          <p className="section-label mb-3">RELATED CALLS</p>
          {relatedCalls.map(rc => (
            <Link key={rc.id} to={`/calls/${rc.id}`}
              className="block mb-2 p-2 border border-border-dim hover:border-border-mid hover:bg-bg-raised transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-electric text-[10px] font-mono">{rc.id}</span>
                <span className="text-text-dim text-[10px] font-mono">{rc.date}</span>
                <span className="text-text-dim text-[9px] font-mono">{rc.callType}</span>
              </div>
              <p className="text-text-secondary text-[10px] font-mono truncate">{rc.intelSummary[0].slice(0, 60)}...</p>
            </Link>
          ))}
        </div>

        {/* Ask about this call */}
        <div className="p-4 mt-auto">
          <p className="section-label mb-2">ASK ABOUT THIS CALL</p>
          <div className="flex items-center gap-2">
            <span className="text-electric text-[11px] font-mono flex-shrink-0">&gt;</span>
            <input
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && askInput.trim()) {
                  navigate(`/chat?context=${displayId}`);
                }
              }}
              placeholder={`ASK ABOUT ${displayId}...`}
              className="flex-1 bg-transparent text-[11px] font-mono text-text-primary placeholder:text-text-dim focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
