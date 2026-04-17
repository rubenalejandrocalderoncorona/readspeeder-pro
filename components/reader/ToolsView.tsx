"use client";

import React, { useState, useCallback } from "react";
import { MacCard, MacButton } from "@/components/macos/MacUI";
import { useAppStore } from "@/store/useAppStore";
import { clsx } from "clsx";
import { RotateCcw, Clock, ChevronUp, ChevronDown } from "lucide-react";

/* ── Settings ─────────────────────────────────────────────────────────────── */
function SettingsPanel() {
  const settings       = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <MacCard>
      <div className="p-5">
        <h3 className="text-[13px] font-semibold text-text dark:text-text-dark mb-4">Settings</h3>

        {/* Max Phrase */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-text-2 dark:text-text-2-dark font-medium">Max Phrase</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[12px] text-text-3 dark:text-text-3-dark cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.autoSetPhrase}
                  onChange={(e) => updateSettings({ autoSetPhrase: e.target.checked })}
                  className="accent-accent w-3.5 h-3.5 rounded"
                />
                Auto Set
              </label>
              <div className="flex gap-1">
                {[3,4,5,6,7].map((n) => (
                  <button
                    key={n}
                    disabled={settings.autoSetPhrase}
                    onClick={() => updateSettings({ maxPhrase: n })}
                    className={clsx(
                      "w-7 h-7 rounded-[var(--radius-sm)] text-[12px] font-medium transition-all",
                      settings.maxPhrase === n
                        ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111]"
                        : "bg-bg-elevated dark:bg-bg-elevated-dark text-text-3 dark:text-text-3-dark hover:bg-border dark:hover:bg-border-dark",
                      settings.autoSetPhrase && "opacity-35 cursor-not-allowed"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {settings.autoSetPhrase && (
            <div className="mt-2 p-3 rounded-[var(--radius-sm)] bg-bg-elevated dark:bg-bg-elevated-dark text-[11px] text-text-3 dark:text-text-3-dark space-y-0.5">
              {[
                { max: 3, label: "below 300 WPM" },
                { max: 4, label: "300–499 WPM" },
                { max: 5, label: "500–599 WPM" },
                { max: 6, label: "600–699 WPM" },
                { max: 7, label: "700+ WPM" },
              ].map((r) => (
                <div key={r.max} className={clsx("flex gap-2", settings.maxPhrase === r.max && "text-accent dark:text-accent-dark font-medium")}>
                  <span className="w-8">{r.max}w</span><span>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Font */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-2 dark:text-text-2-dark font-medium">Font</span>
          <div className="flex gap-1.5">
            <MacButton size="sm" variant={!settings.useSerif ? "primary" : "secondary"} onClick={() => updateSettings({ useSerif: false })}>Sans</MacButton>
            <MacButton size="sm" variant={settings.useSerif ? "primary" : "secondary"} onClick={() => updateSettings({ useSerif: true })}><span className="font-serif">Serif</span></MacButton>
          </div>
        </div>
      </div>
    </MacCard>
  );
}

/* ── Speed Comparison ─────────────────────────────────────────────────────── */
function SpeedComparison() {
  const recentSpeed = useAppStore((s) => s.settings.recentSpeed);
  const base = recentSpeed || 250;
  const [left,  setLeft]  = useState(Math.round(base * 0.9));
  const [right, setRight] = useState(Math.round(base * 1.1));
  const reset = () => { setLeft(Math.round(base * 0.9)); setRight(Math.round(base * 1.1)); };
  const diff = right > 0 ? Math.round((right - left) / left * 100) : 0;

  const Col = ({ wpm, setWpm, label }: { wpm: number; setWpm: (v: number) => void; label: string }) => (
    <div className="flex flex-col items-center gap-2 flex-1">
      <p className="label-mono text-text-4 dark:text-text-4-dark">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-text dark:text-text-dark">{wpm}</p>
      <p className="text-[11px] text-text-4 dark:text-text-4-dark">WPM</p>
      <div className="flex gap-1">
        <MacButton size="sm" variant="secondary" onClick={() => setWpm(wpm + 10)}><ChevronUp size={12} /></MacButton>
        <MacButton size="sm" variant="secondary" onClick={() => setWpm(Math.max(50, wpm - 10))}><ChevronDown size={12} /></MacButton>
      </div>
      <div className="w-full h-1.5 rounded-full bg-border dark:bg-border-dark overflow-hidden">
        <div className="h-full bg-accent dark:bg-accent-dark rounded-full transition-all duration-300" style={{ width: `${Math.min(100,(wpm/700)*100)}%` }} />
      </div>
      <p className="text-[11px] text-text-4 dark:text-text-4-dark">{(wpm/60).toFixed(1)} w/s</p>
    </div>
  );

  return (
    <MacCard>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-text dark:text-text-dark">Speed Comparison</h3>
          <MacButton size="sm" variant="ghost" onClick={reset}><RotateCcw size={11} className="mr-1" />Reset</MacButton>
        </div>
        <div className="flex items-center gap-4">
          <Col wpm={left}  setWpm={setLeft}  label="Current" />
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-accent dark:text-accent-dark">+{diff}%</p>
            <p className="text-[10px] text-text-4 dark:text-text-4-dark">faster</p>
          </div>
          <Col wpm={right} setWpm={setRight} label="Goal" />
        </div>
      </div>
    </MacCard>
  );
}

/* ── Timer ────────────────────────────────────────────────────────────────── */
function TimerTool() {
  const recentSpeed   = useAppStore((s) => s.settings.recentSpeed);
  const [cpl, setCpl] = useState(60);
  const [lpp, setLpp] = useState(30);
  const [rows, setRows] = useState<{page:number;timeMs:number;wpm:number}[]>([]);
  const [last, setLast]   = useState<number|null>(null);
  const [start, setStart] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = recentSpeed || 250;
  const wpp = Math.round((cpl * lpp) / 5);
  const color = (w:number) => w >= ref*1.1 ? "text-ok dark:text-ok-dark" : w <= ref*0.9 ? "text-danger dark:text-danger-dark" : "text-warn dark:text-warn-dark";

  const stamp = useCallback(() => {
    const now = performance.now();
    if (!running) { setRunning(true); setStart(now); setLast(now); setRows([]); return; }
    const elapsed = now - (last ?? now);
    const wpm = Math.round((wpp / elapsed) * 60_000);
    setRows((r) => [...r, { page: r.length+1, timeMs: elapsed, wpm }]);
    setLast(now);
  }, [running, last, wpp]);

  return (
    <MacCard>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-text dark:text-text-dark flex items-center gap-1.5">
            <Clock size={13} className="text-text-4 dark:text-text-4-dark" /> Reading Timer
          </h3>
          <MacButton size="sm" variant="ghost" onClick={() => { setRunning(false); setLast(null); setRows([]); }}>
            <RotateCcw size={11} className="mr-1" />Reset
          </MacButton>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {[{ label:"Chars / Line", val:cpl, set:setCpl },{ label:"Lines / Page", val:lpp, set:setLpp }].map(({label,val,set}) => (
            <div key={label}>
              <p className="text-[11px] text-text-4 dark:text-text-4-dark mb-1">{label}</p>
              <input type="number" value={val} onChange={(e) => set(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] border border-border dark:border-border-dark bg-bg dark:bg-bg-dark outline-none focus:ring-1 focus:ring-accent text-text dark:text-text-dark" />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-4 dark:text-text-4-dark mb-3">~{wpp} words per page</p>

        <MacButton variant="primary" onClick={stamp} className="w-full mb-4">
          {running ? "Time Stamp" : "Start"} <span className="opacity-50 text-[11px] ml-1">(Space)</span>
        </MacButton>

        {rows.length > 0 && (
          <div className="overflow-auto max-h-36 rounded-[var(--radius-sm)] border border-border dark:border-border-dark">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-bg-elevated dark:bg-bg-elevated-dark text-text-4 dark:text-text-4-dark border-b border-border dark:border-border-dark">
                  {["Page","Time","WPM","3pg avg","Overall"].map(h=><th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} className="border-b border-border dark:border-border-dark">
                    <td className="px-2 py-1 text-text-3 dark:text-text-3-dark">{r.page}</td>
                    <td className="px-2 py-1 text-text-4 dark:text-text-4-dark">{(r.timeMs/1000).toFixed(1)}s</td>
                    <td className={clsx("px-2 py-1 font-semibold tabular-nums",color(r.wpm))}>{r.wpm}</td>
                    <td className="px-2 py-1 text-text-4 dark:text-text-4-dark">{i>=2?Math.round(rows.slice(Math.max(0,i-2),i+1).reduce((s,x)=>s+x.wpm,0)/Math.min(3,i+1)):"—"}</td>
                    <td className="px-2 py-1 text-text-4 dark:text-text-4-dark">{Math.round(rows.slice(0,i+1).reduce((s,x)=>s+x.wpm,0)/(i+1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MacCard>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function ToolsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-5 gap-4">
      <h2 className="text-[17px] font-semibold text-text dark:text-text-dark">Tools</h2>
      <SettingsPanel />
      <SpeedComparison />
      <TimerTool />
    </div>
  );
}
