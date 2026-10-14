// Mock data for uploads page — sales call recordings

const REPS = [
  "Sarah Chen", "Mike Rivera", "Jenna Walsh",
  "David Kim", "Lisa Park", "Tom Nguyen",
];

const CALL_TYPES = ["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"];

const CLIENTS = [
  "Mercy Health", "Kaiser Permanente", "HCA Healthcare", "Cleveland Clinic",
  "Mayo Clinic", "Cedars-Sinai", "Johns Hopkins", "Mount Sinai",
  "Banner Health", "Geisinger Health", "NYU Langone", "UCSF Health",
];

const SIGNAL_TAGS_LIST = [
  "FOLLOW-UP REQUIRED", "COMPETITOR MENTIONED", "PRICING OBJECTION",
  "INTEGRATION REQUEST", "RENEWAL SIGNAL", "ESCALATION RISK",
  "DEMO REQUESTED", "BUDGET APPROVED",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateCallTranscript(): { transcript: string; highlights: string[] } {
  const repLines = [
    "Let me walk you through the key features of our platform.",
    "I understand your concerns about pricing — let me break down the ROI.",
    "Based on your team size, I'd recommend our enterprise tier.",
    "We've seen similar organizations achieve 40% time savings.",
    "Can you walk me through your current workflow?",
    "Our integration with Epic is fully certified and HIPAA compliant.",
    "I'll send over a proposal by end of week with those numbers.",
    "How does your team currently handle transcription?",
    "We can definitely customize the dashboard for your needs.",
    "The implementation timeline would be roughly 4-6 weeks.",
  ];
  const clientLines = [
    "We need this before our board meeting next quarter.",
    "How does this compare to what Nuance offers?",
    "Our budget is tight this year — can we do a phased approach?",
    "The physicians are the hardest to get buy-in from.",
    "We tried a similar solution last year and it didn't stick.",
    "Can you integrate with our existing EHR system?",
    "What kind of support do you offer post-implementation?",
    "We're evaluating three vendors right now.",
    "The real-time transcription demo was impressive.",
    "We'd want to pilot this in two departments first.",
  ];

  const highlights: string[] = [];
  const numExchanges = 6 + Math.floor(Math.random() * 6);
  const lines: string[] = [];

  for (let i = 0; i < numExchanges; i++) {
    const rep = randomFrom(repLines);
    const client = randomFrom(clientLines);
    lines.push(`REP:  ${rep}`);
    lines.push(`CLT:  ${client}`);
    if (rep.includes("pricing") || client.includes("budget")) highlights.push("PRICING OBJECTION");
    if (client.includes("Nuance") || client.includes("vendors")) highlights.push("COMPETITOR MENTIONED");
  }

  return { transcript: lines.join("\n"), highlights: [...new Set(highlights)] };
}

function generateIntelSummary(): string[] {
  const summaries = [
    ["Client showed strong interest in enterprise tier — requesting proposal", "Competitor Nuance mentioned as current vendor, cited high cost", "Follow-up scheduled for demo of analytics dashboard"],
    ["Budget constraints identified — recommending phased rollout", "Key stakeholder is VP of Digital Health — decision expected Q3", "Integration with Epic EHR flagged as critical requirement"],
    ["Successful product demo — client impressed by real-time transcription", "Client evaluating 3 vendors — need competitive positioning", "Pilot program proposed for cardiology and emergency departments"],
    ["Account health positive — usage up 40% quarter-over-quarter", "Expansion opportunity in pediatrics department", "Contract renewal in 60 days — prepare pricing options"],
    ["Support issue resolved — CDN latency causing transcript delays", "Client satisfied with resolution but requested SLA documentation", "Engineering escalation ticket created for root cause analysis"],
  ];
  return randomFrom(summaries);
}

export type FileType = "mp3" | "wav" | "m4a" | "ogg" | "flac";
export type UploadStatus = "pending" | "uploading" | "queued" | "transcribing" | "complete" | "error";

export interface UploadFile {
  id: string;
  filename: string;
  type: FileType;
  size: number;
  duration: number; // seconds
  rep: string;
  callType: string;
  callDate: string;
  status: UploadStatus;
  progress: number;
}

export interface TranscriptionResult {
  id: string;
  callId: string;
  rep: string;
  client: string;
  callType: string;
  date: string;
  duration: number;
  wordCount: number;
  confidenceScore: number;
  signalTags: string[];
  transcript: string;
  highlights: string[];
  intelSummary: string[];
  audioFile: string;
}

const FILE_EXTENSIONS: FileType[] = ["mp3", "wav", "m4a"];

function generateFilename(): string {
  const prefixes = ["call", "recording", "demo", "meeting", "qbr", "onboarding", "support"];
  const date = `2026${String(Math.floor(Math.random() * 3) + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
  const id = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `${randomFrom(prefixes)}_${date}_${id}`;
}

export function generateMockResults(count: number): TranscriptionResult[] {
  return Array.from({ length: count }, (_, i) => {
    const { transcript, highlights } = generateCallTranscript();
    const dur = Math.floor(Math.random() * 3000) + 300;
    const words = Math.floor(dur / 60 * (120 + Math.random() * 40));
    const tags: string[] = [];
    const numTags = 1 + Math.floor(Math.random() * 3);
    for (let t = 0; t < numTags; t++) tags.push(randomFrom(SIGNAL_TAGS_LIST));

    const day = Math.floor(i / 8);
    const d = new Date(2026, 2, 28 - day);

    return {
      id: `tr-${i}-${Date.now()}`,
      callId: `CALL-${1200 + i}`,
      rep: randomFrom(REPS),
      client: randomFrom(CLIENTS),
      callType: randomFrom(CALL_TYPES),
      date: d.toISOString().slice(0, 10),
      duration: dur,
      wordCount: words,
      confidenceScore: randomBetween(82, 99.5),
      signalTags: [...new Set(tags)],
      transcript,
      highlights,
      intelSummary: generateIntelSummary(),
      audioFile: `${generateFilename()}.${randomFrom(FILE_EXTENSIONS)}`,
    };
  });
}

export function generateMockUploadFiles(count: number): UploadFile[] {
  return Array.from({ length: count }, (_, i) => {
    const ext = randomFrom(FILE_EXTENSIONS);
    return {
      id: `uf-${i}-${Date.now()}`,
      filename: `${generateFilename()}.${ext}`,
      type: ext,
      size: Math.floor(Math.random() * 50_000_000) + 500_000,
      duration: Math.floor(Math.random() * 3300) + 300,
      rep: randomFrom(REPS),
      callType: randomFrom(CALL_TYPES),
      callDate: "2026-03-28",
      status: "pending" as UploadStatus,
      progress: 0,
    };
  });
}

export function loadResults(): TranscriptionResult[] {
  try {
    const stored = localStorage.getItem("mediscript_results");
    if (stored) {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed)) {
        // Normalize stale/legacy result shapes so UI fields always have values
        return parsed.map((raw, idx) => {
          const r = raw as Record<string, unknown>;
          const callId = String(r.callId ?? r.call_id ?? `CALL-${1200 + idx}`);
          return {
            id: String(r.id ?? `tr-${callId}-${idx}`),
            callId,
            rep: String(r.rep ?? r.repName ?? r.accountRep ?? "UNASSIGNED"),
            client: String(r.client ?? r.clientName ?? r.company ?? "UNKNOWN CLIENT"),
            callType: String(r.callType ?? r.type ?? "DEMO"),
            date: String(r.date ?? new Date().toISOString().slice(0, 10)),
            duration: Number(r.duration ?? 0),
            wordCount: Number(r.wordCount ?? 0),
            confidenceScore: Number(r.confidenceScore ?? r.confidence ?? 0),
            signalTags: Array.isArray(r.signalTags) ? (r.signalTags as string[]) : Array.isArray(r.tags) ? (r.tags as string[]) : [],
            transcript: String(r.transcript ?? r.transcriptText ?? ""),
            highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
            intelSummary: Array.isArray(r.intelSummary) ? (r.intelSummary as string[]) : [],
            audioFile: String(r.audioFile ?? r.filename ?? "unknown.mp3"),
          };
        });
      }
    }
  } catch { /* ignore */ }
  const results = generateMockResults(30);
  localStorage.setItem("mediscript_results", JSON.stringify(results));
  return results;
}

export function saveResults(results: TranscriptionResult[]): void {
  localStorage.setItem("mediscript_results", JSON.stringify(results));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { REPS, CALL_TYPES, CLIENTS };
