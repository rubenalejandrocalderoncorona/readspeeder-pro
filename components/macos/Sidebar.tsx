"use client";

import React from "react";
import { BookOpen, BarChart2, Wrench, Library, HelpCircle, Sun, Moon, GitBranch } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store/useAppStore";
import type { AppState } from "@/store/useAppStore";

type View = AppState["activeView"];

const NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "lessons",  label: "Lessons",  icon: BookOpen  },
  { id: "progress", label: "Progress", icon: BarChart2  },
  { id: "tools",    label: "Tools",    icon: Wrench     },
  { id: "library",  label: "Library",  icon: Library    },
  { id: "help",     label: "Help",     icon: HelpCircle },
];

const REPO_URL = "https://github.com/rubenalejandrocalderoncorona/readspeeder-pro";
const VERSION  = "0.1.0";

export function Sidebar() {
  const activeView     = useAppStore((s) => s.activeView);
  const setActiveView  = useAppStore((s) => s.setActiveView);
  const theme          = useAppStore((s) => s.settings.theme);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const isDark = theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" &&
     window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => updateSettings({ theme: isDark ? "light" : "dark" });

  return (
    <aside className="w-56 shrink-0 flex flex-col select-none sidebar-blur border-r border-ink/[0.07] dark:border-white/[0.05]">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center shadow-md shrink-0">
            <BookOpen size={17} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink dark:text-white/90 leading-none tracking-tight">ReadSpeeder</p>
            <p className="text-[10px] text-ink-4 dark:text-white/30 mt-0.5 tracking-widest uppercase font-medium">Pro</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        <p className="px-2 mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-5 dark:text-white/20">
          Navigation
        </p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={clsx(
                "flex items-center gap-3 w-full px-3 py-2 rounded-[7px] text-[13px] font-medium transition-all duration-150 text-left",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-2 dark:text-white/60 hover:bg-ink/[0.05] dark:hover:bg-white/[0.05] hover:text-ink dark:hover:text-white/80"
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.1 : 1.6}
                className={active ? "text-white/90" : "text-ink-4 dark:text-white/30"} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        <div className="h-px bg-ink/[0.06] dark:bg-white/[0.06] mx-2 mb-1" />
        <div className="flex items-center justify-between px-2">
          <button onClick={toggleTheme}
            className="flex items-center gap-1.5 text-[11px] text-ink-4 dark:text-white/30 hover:text-ink-2 dark:hover:text-white/60 transition-colors"
            title={isDark ? "Switch to light" : "Switch to dark"}>
            {isDark ? <Moon size={13} strokeWidth={1.6} /> : <Sun size={13} strokeWidth={1.6} />}
            <span>{isDark ? "Dark" : "Light"}</span>
          </button>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-ink-5 dark:text-white/20 hover:text-accent dark:hover:text-accent-light transition-colors"
            title="View on GitHub">
            <GitBranch size={11} strokeWidth={1.6} />
            v{VERSION}
          </a>
        </div>
      </div>
    </aside>
  );
}
