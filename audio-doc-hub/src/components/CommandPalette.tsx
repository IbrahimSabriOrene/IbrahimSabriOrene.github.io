import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, FileText, UploadCloud, BarChart2, Settings, Users } from "lucide-react";

const PAGES = [
  { title: "Calls", path: "/", icon: Phone, category: "PAGES" },
  { title: "Transcripts", path: "/chat", icon: FileText, category: "PAGES" },
  { title: "Upload", path: "/uploads", icon: UploadCloud, category: "PAGES" },
  { title: "Intelligence", path: "/reports", icon: BarChart2, category: "PAGES" },
  { title: "Settings", path: "/settings", icon: Settings, category: "PAGES" },
];

const ACTIONS = [
  { title: "Upload call recordings", path: "/uploads", icon: UploadCloud, category: "ACTIONS" },
  { title: "View rep leaderboard", path: "/reports", icon: BarChart2, category: "ACTIONS" },
  { title: "Manage team", path: "/settings", icon: Users, category: "ACTIONS" },
];

const RECENT = [
  { title: "Demo call — Mercy Health — Mar 28", path: "/chat", icon: Phone, category: "RECENT" },
  { title: "QBR — Kaiser Permanente", path: "/chat", icon: Phone, category: "RECENT" },
  { title: "Sarah Chen — onboarding call", path: "/chat", icon: FileText, category: "RECENT" },
];

const ALL_ITEMS = [...PAGES, ...ACTIONS, ...RECENT];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = query
    ? ALL_ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : ALL_ITEMS;

  const handleOpen = useCallback(() => { setOpen(true); setQuery(""); setSelectedIndex(0); }, []);
  const handleClose = useCallback(() => { setOpen(false); setQuery(""); }, []);
  const handleSelect = useCallback((path: string) => { navigate(path); handleClose(); }, [navigate, handleClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) handleClose(); else handleOpen();
      }
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleOpen, handleClose]);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex].path); }
  };

  if (!open) return null;

  const groups: Record<string, typeof filtered> = {};
  filtered.forEach((item) => { if (!groups[item.category]) groups[item.category] = []; groups[item.category].push(item); });
  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-bg-surface border border-border-dim overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-dim">
          <Search size={14} className="text-text-dim flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, records..."
            className="flex-1 bg-transparent text-text-primary text-xs font-mono placeholder:text-text-dim focus:outline-none" />
          <kbd className="text-[9px] font-mono text-text-dim border border-border-dim px-1">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto scroll-thin py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-dim text-xs font-mono">NO RESULTS</div>
          ) : (
            Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <p className="px-4 py-1 section-label">{category}</p>
                {items.map((item) => {
                  flatIdx++;
                  const idx = flatIdx;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button key={`${item.title}-${idx}`} onClick={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                        isSelected ? "bg-electric/10 text-text-primary" : "text-text-secondary hover:bg-bg-raised"
                      }`}>
                      <item.icon size={13} className={isSelected ? "text-electric" : "text-text-dim"} />
                      <span className="text-xs font-mono">{item.title}</span>
                      {isSelected && <span className="ml-auto text-[9px] font-mono text-electric/60">↵</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border-dim flex gap-4 text-[9px] text-text-dim font-mono">
          <span>↑↓ NAVIGATE</span><span>↵ SELECT</span><span>ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
}
