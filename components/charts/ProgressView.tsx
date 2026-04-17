"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, RotateCcw } from "lucide-react";
import { MacButton, MacCard } from "@/components/macos/MacUI";
import { useAppStore } from "@/store/useAppStore";

/* ── Heatmap ───────────────────────────────────────────────────────────── */
function WpmHeatmap({ exerciseHistory }: { exerciseHistory: { date: string; wpm: number }[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; wpm: number; x: number; y: number } | null>(null);

  const dailyMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    exerciseHistory.forEach((e) => {
      const day = new Date(e.date).toISOString().slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(e.wpm);
    });
    const result: Record<string, number> = {};
    Object.entries(map).forEach(([day, wpms]) => {
      result[day] = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
    });
    return result;
  }, [exerciseHistory]);

  const allWpms = Object.values(dailyMap).sort((a, b) => a - b);
  const p25 = allWpms[Math.floor(allWpms.length * 0.25)] ?? 0;
  const p50 = allWpms[Math.floor(allWpms.length * 0.5)] ?? 0;
  const p75 = allWpms[Math.floor(allWpms.length * 0.75)] ?? 0;

  const cellColor = (wpm: number | undefined) => {
    if (!wpm) return "bg-border dark:bg-border-dark";
    if (wpm >= p75) return "bg-accent dark:bg-accent-dark";
    if (wpm >= p50) return "bg-accent/60 dark:bg-accent-dark/60";
    if (wpm >= p25) return "bg-accent/30 dark:bg-accent-dark/30";
    return "bg-accent/15 dark:bg-accent-dark/15";
  };

  // Build 15 weeks x 7 days grid ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WEEKS = 15;
  const endDay = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sun
  // Align end to end of this week (Saturday)
  const daysToSat = 6 - dayOfWeek;
  endDay.setDate(endDay.getDate() + daysToSat);

  const grid: { date: string; wpm?: number }[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: { date: string; wpm?: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(endDay);
      day.setDate(endDay.getDate() - (w * 7 + (6 - d)));
      const key = day.toISOString().slice(0, 10);
      week.push({ date: key, wpm: dailyMap[key] });
    }
    grid.push(week);
  }

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const month = new Date(week[0].date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: new Date(week[0].date).toLocaleString("default", { month: "short" }), col: wi });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  return (
    <div className="relative select-none">
      {/* Month labels */}
      <div className="flex mb-1 ml-6">
        {grid.map((_, wi) => {
          const ml = monthLabels.find((m) => m.col === wi);
          return (
            <div key={wi} className="w-[14px] mr-[2px] text-[9px] text-text-4 dark:text-text-4-dark shrink-0">
              {ml?.label ?? ""}
            </div>
          );
        })}
      </div>
      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-[14px] w-4 text-[9px] text-text-4 dark:text-text-4-dark flex items-center justify-end pr-0.5">
              {i % 2 === 1 ? d : ""}
            </div>
          ))}
        </div>
        {/* Grid */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px] mr-[2px]">
            {week.map((cell, di) => (
              <div
                key={di}
                className={`w-[14px] h-[14px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-80 ${cellColor(cell.wpm)}`}
                onMouseEnter={(e) => cell.wpm && setTooltip({ date: cell.date, wpm: cell.wpm, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 ml-6">
        <span className="text-[9px] text-text-4 dark:text-text-4-dark">Less</span>
        {["bg-border dark:bg-border-dark", "bg-accent/15 dark:bg-accent-dark/15", "bg-accent/30 dark:bg-accent-dark/30", "bg-accent/60 dark:bg-accent-dark/60", "bg-accent dark:bg-accent-dark"].map((c, i) => (
          <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
        ))}
        <span className="text-[9px] text-text-4 dark:text-text-4-dark">More</span>
      </div>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none glass border border-border dark:border-border-dark rounded-[var(--radius-md)] px-2 py-1.5 text-[11px] shadow-md"
          style={{ left: tooltip.x + 10, top: tooltip.y - 36 }}
        >
          <span className="font-semibold text-text dark:text-text-dark">{tooltip.wpm} WPM</span>
          <span className="text-text-4 dark:text-text-4-dark ml-2">{tooltip.date}</span>
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export default function ProgressView() {
  const exerciseHistory = useAppStore((s) => s.exerciseHistory);
  const resetProgress   = useAppStore((s) => s.resetProgress);

  const [confirmReset, setConfirmReset] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [segmentView, setSegmentView] = useState<"bar" | "heatmap">("bar");

  const segmentData = useMemo(() => {
    return exerciseHistory.map((e, i) => ({
      index: i + 1,
      wpm: e.wpm,
      netWpm: e.netWpm,
      concentration: e.concentrationScore,
      lesson: e.lessonId,
      date: new Date(e.date).toLocaleDateString(),
    }));
  }, [exerciseHistory]);

  const allWpms = segmentData.map((d) => d.wpm).sort((a, b) => a - b);
  const third = Math.floor(allWpms.length / 3);
  const low = allWpms[third] ?? 0;
  const high = allWpms[2 * third] ?? 0;
  const barColor = (wpm: number) =>
    wpm >= high ? "#2D7D4F" : wpm >= low ? "#9A6000" : "#B91C1C";

  const dailyWords = useMemo(() => {
    const map: Record<string, number> = {};
    exerciseHistory.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      map[day] = (map[day] ?? 0) + e.wordCount;
    });
    return Object.entries(map).map(([date, words]) => ({ date, words })).slice(-30);
  }, [exerciseHistory]);

  const dailySpeeds = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    exerciseHistory.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      if (!map[day]) map[day] = { total: 0, count: 0 };
      map[day].total += e.wpm;
      map[day].count += 1;
    });
    return Object.entries(map)
      .map(([date, d]) => ({ date, avgWpm: Math.round(d.total / d.count) }))
      .slice(-30);
  }, [exerciseHistory]);

  const csvData = useMemo(() => {
    const header = "Date,Lesson,WPM,NetWPM,Concentration,Words,Duration(s)";
    const rows = exerciseHistory.map((e) =>
      [new Date(e.date).toLocaleString(), e.lessonId, e.wpm, e.netWpm, e.concentrationScore, e.wordCount, Math.round(e.durationMs / 1000)].join(",")
    );
    return [header, ...rows].join("\n");
  }, [exerciseHistory]);

  if (exerciseHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-4 dark:text-text-4-dark">
        <div className="text-center">
          <p className="text-base font-medium">No progress yet</p>
          <p className="text-sm mt-1">Complete exercises in Lessons to see your progress here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-4 gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">Progress</h2>
        <div className="flex gap-2">
          <MacButton size="sm" variant="ghost" onClick={() => setShowCsv((v) => !v)}>
            <Download size={13} className="mr-1.5" /> CSV
          </MacButton>
          {confirmReset ? (
            <>
              <MacButton size="sm" variant="destructive" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                Confirm Reset
              </MacButton>
              <MacButton size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </MacButton>
            </>
          ) : (
            <MacButton size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={13} className="mr-1.5" /> Reset
            </MacButton>
          )}
        </div>
      </div>

      {showCsv && (
        <MacCard>
          <div className="p-3">
            <textarea
              readOnly
              value={csvData}
              className="w-full h-32 text-xs font-mono bg-transparent resize-none outline-none text-text-3 dark:text-text-3-dark"
            />
          </div>
        </MacCard>
      )}

      {/* Segment Speeds / Heatmap */}
      <MacCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-2 dark:text-text-2-dark">
              {segmentView === "bar" ? "Segment Speeds" : "Activity Heatmap"}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setSegmentView("bar")}
                className={`px-2.5 py-1 text-[10px] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase rounded-[var(--radius-xs)] transition-all ${
                  segmentView === "bar"
                    ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111]"
                    : "text-text-3 dark:text-text-3-dark hover:text-text dark:hover:text-text-dark"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setSegmentView("heatmap")}
                className={`px-2.5 py-1 text-[10px] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase rounded-[var(--radius-xs)] transition-all ${
                  segmentView === "heatmap"
                    ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111]"
                    : "text-text-3 dark:text-text-3-dark hover:text-text dark:hover:text-text-dark"
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>

          {segmentView === "bar" ? (
            <>
              <div className="text-xs text-text-4 dark:text-text-4-dark mb-3">
                Green = top third · Yellow = middle · Red = bottom third.
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={segmentData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="glass border border-border dark:border-border-dark rounded-[var(--radius-md)] p-2 text-xs shadow-md">
                          <div className="font-semibold mb-1">Segment {d.index} · Lesson {d.lesson}</div>
                          <div>{d.wpm} WPM · Net: {d.netWpm}</div>
                          <div>Concentration: {d.concentration}%</div>
                          <div className="text-text-4 dark:text-text-4-dark">{d.date}</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="wpm" radius={[3, 3, 0, 0]}>
                    {segmentData.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.wpm)} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="py-2 overflow-x-auto">
              <WpmHeatmap exerciseHistory={exerciseHistory} />
            </div>
          )}
        </div>
      </MacCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Words */}
        <MacCard>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-text-2 dark:text-text-2-dark mb-3">Daily Words</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyWords} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} words`]} />
                <Bar dataKey="words" fill="#B07340" radius={[3, 3, 0, 0]} fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MacCard>

        {/* Daily Speeds */}
        <MacCard>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-text-2 dark:text-text-2-dark mb-3">Daily Speeds</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={dailySpeeds} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v)} WPM`]} />
                <Line
                  type="monotone"
                  dataKey="avgWpm"
                  stroke="#2D7D4F"
                  strokeWidth={2}
                  dot={{ fill: "#2D7D4F", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MacCard>
      </div>
    </div>
  );
}
