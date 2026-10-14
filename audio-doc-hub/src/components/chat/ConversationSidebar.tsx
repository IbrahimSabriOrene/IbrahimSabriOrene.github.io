import { useState } from "react";
import { Search, Plus } from "lucide-react";
import type { ChatSession } from "@/lib/chat-mock-data";

interface Props {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationSidebar({ sessions, activeId, onSelect, onNew }: Props) {
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[280px] flex-shrink-0 h-full flex flex-col bg-[#090B0E] border-r border-border-dim">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-dim">
        <span className="section-label">SESSIONS</span>
        <button
          onClick={onNew}
          className="px-2 py-1 text-[9px] font-mono tracking-[0.08em] text-text-secondary border border-border-mid hover:border-electric hover:text-text-primary transition-colors"
        >
          NEW
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER SESSIONS..."
            className="w-full h-7 bg-bg-surface border border-border-dim text-[11px] font-mono text-text-primary placeholder:text-text-dim pl-7 pr-2 focus:outline-none focus:border-border-mid transition-colors"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {filtered.map((session) => {
          const isActive = session.id === activeId;
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`w-full text-left px-4 py-2.5 h-10 flex items-center transition-colors ${
                isActive
                  ? "bg-bg-surface border-l-2 border-l-electric"
                  : "border-l-2 border-l-transparent hover:bg-bg-raised"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-electric text-[10px] font-mono flex-shrink-0">
                    SESS-{session.id.replace("s", "").padStart(3, "0")}
                  </span>
                </div>
                <p className="text-text-primary text-xs font-mono truncate mt-0.5">{session.title}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                <span className="text-text-dim text-[10px] font-mono">{session.timestamp}</span>
                <span className="text-text-dim text-[9px] font-mono">{session.messageCount} msgs</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom context */}
      <div className="px-4 py-3 border-t border-border-dim">
        <p className="text-text-dim text-[10px] font-mono">CONTEXT: 247 CALLS LOADED</p>
        <p className="text-text-dim text-[9px] font-mono mt-0.5 opacity-60">DATABASE LAST UPDATED 00:14 AGO</p>
      </div>
    </div>
  );
}
