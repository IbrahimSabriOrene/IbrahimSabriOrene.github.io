export interface CallRecord {
  callId: string;
  client: string;
  contact: string;
  repName: string;
  callType: string;
  duration: string;
  snippet: string;
  signalTags: string[];
  confidenceScore: number;
  date: string;
}

export const mockCallRecords: CallRecord[] = [
  { callId: "CALL-1247", client: "Mercy Health System", contact: "Dr. James Liu", repName: "Sarah Chen", callType: "DEMO", duration: "32:10", snippet: "Walked through platform capabilities including real-time transcription, HIPAA compliance dashboard, and EHR integration. Client expressed strong interest in pilot program for Q2. Mentioned current vendor Nuance is expensive and lacks analytics...", signalTags: ["COMPETITOR MENTIONED", "PRICING OBJECTION"], confidenceScore: 97.2, date: "2026-03-28" },
  { callId: "CALL-1246", client: "Kaiser Permanente", contact: "Rachel Torres", repName: "Mike Rivera", callType: "QBR", duration: "45:00", snippet: "Quarterly business review covering adoption metrics, user satisfaction scores, and roadmap alignment. Client requested API access for custom reporting. Discussed contract renewal timeline for August...", signalTags: ["RENEWAL SIGNAL", "INTEGRATION REQUEST"], confidenceScore: 96.8, date: "2026-03-28" },
  { callId: "CALL-1245", client: "HCA Healthcare", contact: "Mark Sullivan", repName: "Jenna Walsh", callType: "SUPPORT", duration: "18:45", snippet: "Troubleshooting audio quality issues in their radiology department. Recommended microphone placement adjustments and updated noise cancellation settings. Client satisfied with resolution...", signalTags: ["FOLLOW-UP REQUIRED"], confidenceScore: 94.1, date: "2026-03-28" },
  { callId: "CALL-1244", client: "Cleveland Clinic", contact: "Anita Patel", repName: "David Kim", callType: "ONBOARDING", duration: "55:20", snippet: "Initial onboarding session covering admin setup, user provisioning, SSO configuration, and training schedule. Client has 200 physicians to onboard over 6 weeks. Discussed phased rollout strategy...", signalTags: ["FOLLOW-UP REQUIRED"], confidenceScore: 96.5, date: "2026-03-27" },
  { callId: "CALL-1243", client: "Mayo Clinic", contact: "Steven Wright", repName: "Sarah Chen", callType: "DEMO", duration: "28:30", snippet: "Product demo focused on AI summarization and action item extraction. Client comparing us with Deepgram and AssemblyAI. Budget approved for Q3 implementation. Key decision maker is VP of Digital Health...", signalTags: ["COMPETITOR MENTIONED", "RENEWAL SIGNAL"], confidenceScore: 97.8, date: "2026-03-27" },
  { callId: "CALL-1242", client: "Cedars-Sinai", contact: "Diana Reyes", repName: "Lisa Park", callType: "ACCOUNT REVIEW", duration: "35:15", snippet: "Account health check — usage up 40% QoQ. Discussed expansion to pediatrics and emergency departments. Client mentioned budget freeze until July but willing to commit to annual contract...", signalTags: ["PRICING OBJECTION", "RENEWAL SIGNAL"], confidenceScore: 95.3, date: "2026-03-27" },
  { callId: "CALL-1241", client: "Johns Hopkins", contact: "Brian Chen", repName: "Tom Nguyen", callType: "SUPPORT", duration: "12:40", snippet: "Client reported intermittent latency in transcript delivery. Investigated and found regional CDN issue. Escalated to engineering with priority flag. Provided workaround using direct API endpoint...", signalTags: ["ESCALATION RISK"], confidenceScore: 93.7, date: "2026-03-26" },
  { callId: "CALL-1240", client: "Mount Sinai", contact: "Karen Foster", repName: "Mike Rivera", callType: "QBR", duration: "40:00", snippet: "Reviewed NPS scores and feature usage data. Client loves ambient capture mode but wants better speaker diarization. Discussed upcoming v3 model improvements. Contract renewal in 60 days...", signalTags: ["INTEGRATION REQUEST", "RENEWAL SIGNAL"], confidenceScore: 96.1, date: "2026-03-26" },
  { callId: "CALL-1239", client: "Banner Health", contact: "Robert Kim", repName: "Jenna Walsh", callType: "DEMO", duration: "22:15", snippet: "Initial demo for 12-hospital system. Strong fit for orthopedics and cardiology departments. Competitor Dragon Medical One currently deployed. Client open to parallel pilot...", signalTags: ["COMPETITOR MENTIONED"], confidenceScore: 97.4, date: "2026-03-25" },
  { callId: "CALL-1238", client: "Geisinger Health", contact: "Amy Liu", repName: "David Kim", callType: "ONBOARDING", duration: "48:30", snippet: "Week 2 onboarding check-in. 45 of 120 users activated. Discussed adoption blockers — main issue is workflow integration with Epic EHR. Scheduled follow-up with Epic integration team...", signalTags: ["FOLLOW-UP REQUIRED", "INTEGRATION REQUEST"], confidenceScore: 95.9, date: "2026-03-25" },
];

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
}

export const mockSessions: ChatSession[] = [
  { id: "s1", title: "Demo call analysis — this week", timestamp: "12 min ago", messageCount: 12 },
  { id: "s2", title: "Competitor mentions breakdown", timestamp: "2 hrs ago", messageCount: 8 },
  { id: "s3", title: "Weekly rep performance summary", timestamp: "Yesterday", messageCount: 5 },
  { id: "s4", title: "Escalation risk — Johns Hopkins", timestamp: "Yesterday", messageCount: 14 },
  { id: "s5", title: "Renewal pipeline Q2", timestamp: "Mar 26", messageCount: 6 },
  { id: "s6", title: "Sarah Chen call quality review", timestamp: "Mar 26", messageCount: 9 },
  { id: "s7", title: "Action items audit — week 13", timestamp: "Mar 25", messageCount: 3 },
  { id: "s8", title: "QBR prep — Kaiser account", timestamp: "Mar 24", messageCount: 7 },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const mockResponses: Record<string, string> = {
  "demo": `DEMO CALLS THIS WEEK — 3 TOTAL

| CALL ID   | CLIENT          | REP          | DURATION | CONFIDENCE | KEY SIGNALS              |
|-----------|-----------------|--------------|----------|------------|--------------------------|
| CALL-1247 | Mercy Health    | Sarah Chen   | 32:10    | 97.2%      | Competitor, Pricing      |
| CALL-1243 | Mayo Clinic     | Sarah Chen   | 28:30    | 97.8%      | Competitor, Renewal      |
| CALL-1239 | Banner Health   | Jenna Walsh  | 22:15    | 97.4%      | Competitor               |

All 3 demos involved competitor comparisons. Nuance, Deepgram, AssemblyAI, and Dragon Medical One were mentioned.

  · Sarah Chen ran 2 of 3 demos with highest avg confidence (97.5%)
  · Total demo time: 1h 22m 55s
  · All prospects have budget timelines in Q2-Q3`,

  "competitor": `COMPETITOR MENTIONS — LAST 7 DAYS

4 calls referenced competitors across 3 accounts:

  · NUANCE — Mercy Health (CALL-1247) — "current vendor, expensive, lacks analytics"
  · DEEPGRAM — Mayo Clinic (CALL-1243) — comparison evaluation
  · ASSEMBLYAI — Mayo Clinic (CALL-1243) — comparison evaluation
  · DRAGON MEDICAL ONE — Banner Health (CALL-1239) — currently deployed

Competitor mention rate: 40% of calls (4/10)
Most mentioned: Nuance (appears in 2 separate accounts)

Recommended action: prep competitive battle cards for Sarah Chen and Jenna Walsh ahead of follow-up calls.`,

  "confidence": `REP CONFIDENCE SCORES — RANKED

| RANK | REP          | AVG CONFIDENCE | CALLS | LOWEST SCORE |
|------|--------------|----------------|-------|--------------|
| 1    | Sarah Chen   | 97.5%          | 2     | 97.2%        |
| 2    | Jenna Walsh  | 95.8%          | 2     | 94.1%        |
| 3    | David Kim    | 96.2%          | 2     | 95.9%        |
| 4    | Mike Rivera  | 96.5%          | 2     | 96.1%        |
| 5    | Lisa Park    | 95.3%          | 1     | 95.3%        |
| 6    | Tom Nguyen   | 93.7%          | 1     | 93.7%        |

Tom Nguyen's CALL-1241 (Johns Hopkins support) had the lowest confidence at 93.7%. This may be due to audio quality issues reported during the call.`,

  "default": `DATABASE SUMMARY — 247 CALLS INDEXED

Active records from last 7 days: 10 calls across 6 reps

  · CALL TYPES: 3 Demo, 2 QBR, 2 Support, 2 Onboarding, 1 Account Review
  · TOTAL DURATION: 5h 38m 25s
  · AVG CONFIDENCE: 96.1%
  · SIGNAL TAGS: 14 total across 6 categories

Top signals by frequency:
  · FOLLOW-UP REQUIRED — 4 calls
  · RENEWAL SIGNAL — 4 calls
  · COMPETITOR MENTIONED — 3 calls
  · INTEGRATION REQUEST — 3 calls
  · PRICING OBJECTION — 2 calls
  · ESCALATION RISK — 1 call

Query me about specific reps, clients, call types, signals, or time ranges.`
};

export function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("demo")) return mockResponses.demo;
  if (lower.includes("competitor") || lower.includes("mention")) return mockResponses.competitor;
  if (lower.includes("confidence") || lower.includes("score") || lower.includes("lowest")) return mockResponses.confidence;
  if (lower.includes("pricing") || lower.includes("objection")) return mockResponses.competitor;
  if (lower.includes("summarize") || lower.includes("summary")) return mockResponses.default;
  return mockResponses.default;
}
