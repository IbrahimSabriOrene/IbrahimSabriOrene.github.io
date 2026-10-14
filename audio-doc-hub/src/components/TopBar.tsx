import { NavLink, useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { title: "CALLS", path: "/" },
  { title: "TRANSCRIPTS", path: "/chat" },
  { title: "UPLOAD", path: "/uploads" },
  { title: "INTELLIGENCE", path: "/reports" },
  { title: "SETTINGS", path: "/settings" },
];

export function TopBar() {
  const location = useLocation();
  const [syncSeconds, setSyncSeconds] = useState(14);

  useEffect(() => {
    const i = setInterval(() => setSyncSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const handleCmdK = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" || location.pathname.startsWith("/calls");
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="h-11 border-b border-border-dim bg-bg-base flex items-center px-6 gap-6 flex-shrink-0">
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <span className="text-electric font-mono font-semibold text-[13px]">▮</span>
          <span className="text-text-primary font-mono font-semibold text-[13px] tracking-[0.04em]">MEDISCRIPT</span>
        </div>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 text-[11px] font-mono font-medium tracking-[0.08em] transition-colors ${
                isActive(item.path) ? "text-text-primary" : "text-text-dim hover:text-text-secondary"
              }`}
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <button onClick={handleCmdK}
          className="flex items-center gap-1.5 px-2 py-1 border border-border-dim text-text-dim text-[10px] font-mono hover:border-border-mid hover:text-text-secondary transition-colors">
          <Search size={11} />
          <kbd className="text-[9px] border border-border-dim px-1">⌘K</kbd>
        </button>

        <button className="p-1.5 text-text-dim hover:text-text-secondary transition-colors relative">
          <Bell size={14} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-electric" />
        </button>

        <div className="w-7 h-7 bg-bg-raised border border-border-dim flex items-center justify-center text-[10px] font-mono text-text-secondary rounded-full">
          AE
        </div>
      </header>

      <div className="h-7 border-b border-border-dim bg-[#090B0E] px-6 flex items-center text-[10px] font-mono text-text-dim flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-positive status-pulse rounded-full" />
          <span>WHISPER PIPELINE ACTIVE</span>
        </span>
        <span className="mx-3 text-text-dim">·</span>
        <span>LAST SYNC {String(Math.floor(syncSeconds / 60)).padStart(2, "0")}:{String(syncSeconds % 60).padStart(2, "0")} AGO</span>
        <div className="flex-1" />
        <span>247 CALLS PROCESSED TODAY</span>
        <span className="mx-2 text-text-dim">·</span>
        <span>38.4 HRS</span>
      </div>
    </>
  );
}
