import { useState, useMemo } from "react";
import { Download, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CALL_TYPES = ["DEMO", "ONBOARDING", "SUPPORT", "ACCOUNT REVIEW", "QBR"];
const REPS = [
  { name: "Sarah Chen", initials: "SC" },
  { name: "Mike Rivera", initials: "MR" },
  { name: "Jenna Walsh", initials: "JW" },
  { name: "David Kim", initials: "DK" },
  { name: "Lisa Park", initials: "LP" },
  { name: "Tom Nguyen", initials: "TN" },
];

function seedRandom(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function generateDailyVolumes() {
  const rng = seedRandom(42);
  return Array.from({ length: 30 }, (_, i) => {
    const base = 6 + Math.floor(rng() * 12);
    const dayOfWeek = (new Date(2026, 2, i + 1)).getDay();
    const weekendDip = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.3 : 1;
    return { day: i + 1, volume: Math.round(base * weekendDip) };
  });
}

function generateTypeBreakdown() {
  const rng = seedRandom(99);
  return CALL_TYPES.map(d => ({ name: d, count: Math.floor(rng() * 80) + 10 })).sort((a, b) => b.count - a.count);
}

function generateLeaderboard() {
  const rng = seedRandom(77);
  return REPS.map(c => ({
    ...c,
    count: Math.floor(rng() * 60) + 15,
    hours: Math.round((rng() * 40 + 10) * 10) / 10,
    avgConfidence: Math.round((rng() * 8 + 91) * 10) / 10,
    trend: rng() > 0.4 ? "up" as const : "down" as const,
  })).sort((a, b) => b.count - a.count);
}

const DATE_RANGES = ["Today", "This Week", "This Month", "Custom"] as const;

function BarChart({ data }: { data: { day: number; volume: number }[] }) {
  const maxVol = Math.max(...data.map(d => d.volume));
  const chartH = 160;
  const chartW = 700;
  const barW = (chartW - 50) / data.length - 2;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = chartH - frac * chartH;
        return (
          <g key={frac}>
            <line x1="30" y1={y} x2={chartW} y2={y} stroke="hsl(var(--border-dim))" strokeWidth="1" />
            <text x="26" y={y + 3} textAnchor="end" fill="hsl(var(--text-dim))" fontSize="8" fontFamily="var(--font-mono)">{Math.round(maxVol * frac)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = maxVol > 0 ? (d.volume / maxVol) * chartH : 0;
        const x = 34 + i * (barW + 2);
        const isHovered = hover === i;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
            <rect x={x} y={chartH - h} width={barW} height={h}
              fill={isHovered ? "hsl(var(--electric))" : "hsl(var(--electric) / 0.7)"}
              className="transition-all duration-100"
            />
            {(d.day % 5 === 0 || d.day === 1) && (
              <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fill="hsl(var(--text-dim))" fontSize="8" fontFamily="var(--font-mono)">
                {d.day}
              </text>
            )}
            {isHovered && (
              <g>
                <rect x={x - 14} y={chartH - h - 20} width="48" height="16" fill="hsl(var(--bg-raised))" stroke="hsl(var(--electric))" strokeWidth="0.5" />
                <text x={x + barW / 2} y={chartH - h - 8} textAnchor="middle" fill="hsl(var(--text-primary))" fontSize="9" fontFamily="var(--font-mono)">{d.volume} calls</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBarChart({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="text-[10px] text-text-secondary font-mono w-28 text-right truncate">{d.name}</span>
          <div className="flex-1 h-[2px] bg-border-dim">
            <div className="h-full bg-electric transition-all duration-500" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="text-[10px] font-mono text-text-secondary w-8 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 120;
  const r = 48;
  const inner = 32;
  let cumAngle = -90;

  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const largeArc = angle > 180 ? 1 : 0;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = size / 2 + r * Math.cos(toRad(startAngle));
    const y1 = size / 2 + r * Math.sin(toRad(startAngle));
    const x2 = size / 2 + r * Math.cos(toRad(endAngle));
    const y2 = size / 2 + r * Math.sin(toRad(endAngle));
    const ix1 = size / 2 + inner * Math.cos(toRad(endAngle));
    const iy1 = size / 2 + inner * Math.sin(toRad(endAngle));
    const ix2 = size / 2 + inner * Math.cos(toRad(startAngle));
    const iy2 = size / 2 + inner * Math.sin(toRad(startAngle));
    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${largeArc} 0 ${ix2} ${iy2} Z` };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill="hsl(var(--text-primary))" fontSize="16" fontFamily="var(--font-mono)" fontWeight="500">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-2 h-2" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-text-secondary font-mono">{d.label}</span>
            <span className="text-[10px] font-mono text-text-dim ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<typeof DATE_RANGES[number]>("This Month");

  const dailyData = useMemo(() => generateDailyVolumes(), []);
  const typeData = useMemo(() => generateTypeBreakdown(), []);
  const leaderboard = useMemo(() => generateLeaderboard(), []);

  const totalCalls = dailyData.reduce((s, d) => s + d.volume, 0);
  const totalHours = Math.round(totalCalls * 0.38 * 10) / 10;

  const tagData = [
    { label: "FOLLOW-UP REQUIRED", value: 41, color: "hsl(var(--electric))" },
    { label: "COMPETITOR MENTIONED", value: 18, color: "hsl(var(--warn))" },
    { label: "PRICING OBJECTION", value: 12, color: "hsl(var(--critical))" },
    { label: "RENEWAL SIGNAL", value: 22, color: "hsl(var(--positive))" },
  ];

  return (
    <div className="h-full overflow-y-auto scroll-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-border-dim">
          <div>
            <h1 className="text-text-primary text-sm font-mono font-semibold tracking-[0.04em]">INTELLIGENCE DASHBOARD</h1>
            <p className="text-text-dim text-[10px] font-mono mt-1">CALL ANALYTICS AND OPERATIONAL INSIGHTS</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}
              className="h-7 bg-bg-surface border border-border-dim text-[10px] font-mono text-text-secondary px-2 focus:outline-none focus:border-electric transition-colors">
              {DATE_RANGES.map((r) => <option key={r} value={r} className="bg-bg-raised">{r}</option>)}
            </select>
            <button onClick={() => toast({ title: "Report exported", description: "PDF generating..." })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-bg-base bg-electric hover:bg-electric/90 transition-colors">
              <Download size={11} /> EXPORT PDF
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-px mb-6">
          {[
            { label: "TOTAL CALLS", value: totalCalls, sub: "this month" },
            { label: "HOURS PROCESSED", value: totalHours, sub: "across 6 reps" },
            { label: "ACTIVE REPS", value: 6, sub: "team members" },
            { label: "AVG CONFIDENCE", value: "96.1%", sub: "whisper large-v3", color: "text-electric" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-bg-surface border border-border-dim px-5 py-4">
              <p className="section-label mb-2">{kpi.label}</p>
              <p className={`text-2xl font-mono font-semibold ${kpi.color || "text-text-primary"}`}>{kpi.value}</p>
              <p className="text-[10px] font-mono text-text-dim mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-5 gap-px mb-6">
          <div className="col-span-3 bg-bg-surface border border-border-dim p-5">
            <h3 className="section-label mb-4">CALL VOLUME — LAST 30 DAYS</h3>
            <BarChart data={dailyData} />
          </div>
          <div className="col-span-2 bg-bg-surface border border-border-dim p-5">
            <h3 className="section-label mb-4">CALL TYPE BREAKDOWN</h3>
            <HorizontalBarChart data={typeData} />
          </div>
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-5 gap-px">
          <div className="col-span-3 bg-bg-surface border border-border-dim p-5">
            <h3 className="section-label mb-4">REP LEADERBOARD</h3>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-border-dim text-text-dim tracking-[0.08em]">
                  <th className="text-left py-2 w-6">#</th>
                  <th className="text-left py-2">REP</th>
                  <th className="text-right py-2">CALLS</th>
                  <th className="text-right py-2">HOURS</th>
                  <th className="text-right py-2">AVG CONF.</th>
                  <th className="text-right py-2 w-10">TREND</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((c, i) => (
                  <tr key={c.name} className="border-b border-border-dim hover:bg-bg-raised transition-colors">
                    <td className="py-2 text-text-dim">{i + 1}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-bg-raised border border-border-dim flex items-center justify-center text-[9px] text-text-secondary rounded-full flex-shrink-0">{c.initials}</div>
                        <span className="text-text-primary">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-text-secondary">{c.count}</td>
                    <td className="py-2 text-right text-text-secondary">{c.hours}h</td>
                    <td className="py-2 text-right">
                      <span className={c.avgConfidence >= 95 ? "text-electric" : c.avgConfidence >= 90 ? "text-warn" : "text-critical"}>{c.avgConfidence}%</span>
                    </td>
                    <td className="py-2 text-right">
                      {c.trend === "up" ? <TrendingUp size={12} className="text-positive inline" /> : <TrendingDown size={12} className="text-critical inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-span-2 bg-bg-surface border border-border-dim p-5">
            <h3 className="section-label mb-4">SIGNAL TAG ANALYSIS</h3>
            <DonutChart data={tagData} />
            <div className="mt-4 space-y-1.5">
              {tagData.map(d => (
                <div key={d.label} className="flex items-center gap-2 text-[10px] font-mono text-text-dim">
                  <div className="w-1.5 h-1.5" style={{ backgroundColor: d.color }} />
                  <span>{d.value} calls with {d.label.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
