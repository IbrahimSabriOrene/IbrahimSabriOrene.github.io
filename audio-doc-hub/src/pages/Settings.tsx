import { useState } from "react";
import { X, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USERS = [
  { name: "Sarah Chen", email: "s.chen@example.test", role: "ADMIN", calls: 54, joined: "2025-08-12" },
  { name: "Mike Rivera", email: "m.rivera@example.test", role: "REP", calls: 48, joined: "2025-09-03" },
  { name: "Jenna Walsh", email: "j.walsh@example.test", role: "REP", calls: 41, joined: "2025-09-15" },
  { name: "David Kim", email: "d.kim@example.test", role: "REP", calls: 37, joined: "2025-10-01" },
  { name: "Lisa Park", email: "l.park@example.test", role: "REP", calls: 33, joined: "2025-11-20" },
  { name: "Tom Nguyen", email: "t.nguyen@example.test", role: "MANAGER", calls: 12, joined: "2025-08-12" },
  { name: "Rachel Adams", email: "r.adams@example.test", role: "VIEWER", calls: 0, joined: "2026-01-05" },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "text-electric border-electric/30",
  REP: "text-positive border-positive/30",
  MANAGER: "text-warn border-warn/30",
  VIEWER: "text-text-dim border-border-mid",
};

export default function Settings() {
  const { toast } = useToast();
  const [provider, setProvider] = useState("OPENAI WHISPER");
  const [model, setModel] = useState("WHISPER LARGE-V3");
  const [language, setLanguage] = useState("EN-US");
  const [confidence, setConfidence] = useState(90);
  const [diarization, setDiarization] = useState("ENABLED");

  const [keywords, setKeywords] = useState(["competitor", "pricing", "budget", "churn", "cancel", "escalate"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [detectCompetitors, setDetectCompetitors] = useState(true);
  const [flagPricing, setFlagPricing] = useState(true);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword("");
    }
  };

  const handleSave = () => toast({ title: "✓ SETTINGS SAVED" });
  const handleReset = () => {
    localStorage.removeItem("mediscript_results");
    setShowResetConfirm(false);
    toast({ title: "✓ DATA RESET COMPLETE" });
  };

  return (
    <div className="h-full overflow-y-auto scroll-thin">
      <div className="p-6 max-w-4xl">
        <div className="pb-5 mb-6 border-b border-border-dim">
          <h1 className="text-text-primary text-sm font-mono font-semibold tracking-[0.04em]">SETTINGS</h1>
          <p className="text-text-dim text-[10px] font-mono mt-1">CONFIGURE MEDISCRIPT WORKSPACE</p>
        </div>

        {/* TRANSCRIPTION ENGINE */}
        <Section title="TRANSCRIPTION ENGINE">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Field label="PROVIDER">
              <Select value={provider} onChange={setProvider} options={["OPENAI WHISPER", "DEEPGRAM", "ASSEMBLYAI"]} />
            </Field>
            <Field label="MODEL">
              <Select value={model} onChange={setModel} options={["WHISPER LARGE-V3", "WHISPER LARGE-V2", "WHISPER MEDIUM"]} />
            </Field>
            <Field label="LANGUAGE">
              <Select value={language} onChange={setLanguage} options={["EN-US", "EN-GB", "ES", "DE", "FR", "PT"]} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`CONFIDENCE THRESHOLD: ${confidence}%`}>
              <input type="range" min="50" max="99" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-[2px] appearance-none bg-border-dim cursor-pointer accent-electric [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-electric [&::-webkit-slider-thumb]:border-0" />
              <p className="text-text-dim text-[9px] font-mono mt-1">BELOW THIS THRESHOLD, CALLS ARE FLAGGED FOR REVIEW</p>
            </Field>
            <Field label="DIARIZATION">
              <Select value={diarization} onChange={setDiarization} options={["ENABLED", "DISABLED"]} />
              <p className="text-text-dim text-[9px] font-mono mt-1">SPEAKER SEPARATION IN TRANSCRIPTS</p>
            </Field>
          </div>
        </Section>

        {/* SIGNAL DETECTION */}
        <Section title="SIGNAL DETECTION">
          <Field label="AUTO-FLAG KEYWORDS">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {keywords.map((k) => (
                <span key={k} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border border-border-dim text-text-secondary">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter(kw => kw !== k))} className="text-text-dim hover:text-critical transition-colors"><X size={8} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="ADD KEYWORD..."
                className="h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-primary placeholder:text-text-dim px-2 w-48 focus:outline-none focus:border-electric transition-colors" />
              <button onClick={addKeyword} className="h-7 px-2 border border-border-dim text-text-dim hover:text-text-secondary hover:border-border-mid transition-colors"><Plus size={12} /></button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Toggle label="AUTO-DETECT COMPETITOR MENTIONS" desc="Flag calls where competitor names appear" checked={detectCompetitors} onChange={setDetectCompetitors} />
            <Toggle label="FLAG PRICING DISCUSSIONS" desc="Flag calls with pricing or budget keywords" checked={flagPricing} onChange={setFlagPricing} />
          </div>
        </Section>

        {/* TEAM */}
        <Section title="TEAM">
          <div className="border border-border-dim mb-3">
            <table className="w-full text-[11px] font-mono">
              <thead className="bg-bg-surface border-b border-border-dim text-text-dim tracking-[0.08em]">
                <tr>
                  <th className="text-left px-3 py-2">NAME</th>
                  <th className="text-left px-3 py-2">EMAIL</th>
                  <th className="text-left px-3 py-2">ROLE</th>
                  <th className="text-right px-3 py-2">CALLS/MO</th>
                  <th className="text-left px-3 py-2">JOINED</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u, i) => (
                  <tr key={u.email} className={`border-b border-border-dim hover:bg-bg-raised transition-colors ${i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"}`}>
                    <td className="px-3 py-2 text-text-primary">{u.name}</td>
                    <td className="px-3 py-2 text-text-dim">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-text-secondary">{u.calls}</td>
                    <td className="px-3 py-2 text-text-dim">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="text-[10px] font-mono text-electric border border-electric/30 px-3 py-1 hover:bg-electric/5 transition-colors">
            + INVITE USER
          </button>
        </Section>

        {/* INTEGRATIONS */}
        <Section title="INTEGRATIONS">
          <div className="space-y-0">
            {[
              { name: "OPENAI API KEY", status: "••••••••••••4a2f", connected: true, action: "EDIT" },
              { name: "ZOOM", status: "AUTO-IMPORTS RECORDED CALLS", connected: true, action: "DISCONNECT" },
              { name: "SALESFORCE", status: "NOT CONNECTED", connected: false, action: "CONNECT" },
              { name: "SLACK", status: "NOT CONNECTED", connected: false, action: "CONNECT" },
            ].map(int => (
              <div key={int.name} className="flex items-center justify-between py-3 border-b border-border-dim">
                <div>
                  <p className="text-text-primary text-[11px] font-mono">{int.name}</p>
                  <p className="text-text-dim text-[10px] font-mono mt-0.5">
                    {int.connected && <span className="text-positive mr-1">✓</span>}
                    {!int.connected && <span className="text-text-dim mr-1">—</span>}
                    {int.status}
                  </p>
                </div>
                <button className={`text-[10px] font-mono px-3 py-1 border transition-colors ${
                  int.connected ? "text-text-secondary border-border-dim hover:border-border-mid" : "text-electric border-electric/30 hover:bg-electric/5"
                }`}>
                  {int.action}
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center justify-between py-6 border-t border-border-dim mt-6">
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-mono text-bg-base bg-electric hover:bg-electric/90 transition-colors">
            <Save size={11} /> SAVE CHANGES
          </button>
          <div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-critical">CONFIRM RESET ALL DATA?</span>
                <button onClick={() => setShowResetConfirm(false)} className="text-text-dim border border-border-dim px-2 py-0.5 hover:text-text-secondary transition-colors">CANCEL</button>
                <button onClick={handleReset} className="text-bg-base bg-critical px-2 py-0.5 hover:bg-critical/90 transition-colors">DELETE EVERYTHING</button>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="text-[10px] font-mono text-critical/60 hover:text-critical transition-colors">
                RESET ALL DATA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="section-label mb-4">{title}</h2>
      <div className="border-b border-border-dim mb-1 -mt-3" />
      <div className="pt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] font-mono text-text-dim tracking-[0.08em] block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
      {options.map(o => <option key={o} value={o} className="bg-bg-raised">{o}</option>)}
    </select>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-[11px] font-mono">{label}</p>
        <p className="text-text-dim text-[9px] font-mono mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 transition-colors ${checked ? "bg-electric" : "bg-border-dim"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-text-primary transition-transform ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
