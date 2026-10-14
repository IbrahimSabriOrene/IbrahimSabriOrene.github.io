import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, UploadCloud, BarChart2, Settings, Command } from "lucide-react";

const navItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "Chat", path: "/chat", icon: MessageSquare },
  { title: "Uploads", path: "/uploads", icon: UploadCloud },
  { title: "Reports", path: "/reports", icon: BarChart2 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col justify-between bg-navy transition-all duration-300 ease-in-out"
        style={{
          width: expanded ? 240 : 72,
          backgroundImage: "var(--grain-texture)",
          backgroundRepeat: "repeat",
        }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-navy-light/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber">
                <path d="M3 12h2l2-6 3 12 3-8 2 4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="16" y="18" fontSize="8" fontWeight="bold" fill="currentColor" fontFamily="var(--font-display)">M</text>
              </svg>
            </div>
            <span className="text-bone font-display text-lg whitespace-nowrap transition-opacity duration-200"
              style={{ opacity: expanded ? 1 : 0 }}>
              MediScript
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                  isActive ? "nav-active-glow bg-navy-light/50 text-bone" : "text-mist hover:text-bone hover:bg-navy-light/30"
                }`}>
                <item.icon size={20} className={`flex-shrink-0 ${isActive ? "text-amber" : ""}`} />
                <span className="text-sm font-body whitespace-nowrap transition-opacity duration-200"
                  style={{ opacity: expanded ? 1 : 0 }}>{item.title}</span>
              </NavLink>
            );
          })}

          {/* Cmd+K hint */}
          <div className="mt-4 px-3">
            <div className={`flex items-center gap-2 text-[10px] font-mono text-mist/30 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
              <Command size={10} /> <span>⌘K to search</span>
            </div>
          </div>
        </nav>

        {/* Status + timestamp */}
        <div className="px-4 py-3 border-t border-navy-light/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-success status-pulse flex-shrink-0" />
            <span className="text-xs font-mono text-mist whitespace-nowrap transition-opacity duration-200"
              style={{ opacity: expanded ? 1 : 0 }}>System Online</span>
          </div>
          <p className="text-[9px] font-mono text-mist/30 mt-1.5 whitespace-nowrap transition-opacity duration-200"
            style={{ opacity: expanded ? 1 : 0 }}>
            Updated {timeStr}
          </p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-center h-16 bg-navy border-t border-navy-light/30"
        style={{ backgroundImage: "var(--grain-texture)", backgroundRepeat: "repeat" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-amber" : "text-mist/60"
              }`}>
              <item.icon size={20} />
              <span className="text-[9px] font-body">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
