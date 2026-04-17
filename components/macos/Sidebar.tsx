"use client";

import React, { useEffect, useState } from "react";
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

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () => updateSettings({ theme: isDark ? "light" : "dark" });

  return (
    <aside className="w-56 shrink-0 flex flex-col select-none sidebar-blur border-r border-border dark:border-border-dark">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-accent dark:bg-accent-dark flex items-center justify-center shrink-0">
            <BookOpen size={17} className="text-white dark:text-[#111]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text dark:text-text-dark leading-none tracking-tight">ReadSpeeder</p>
            <p className="label-mono text-text-4 dark:text-text-4-dark mt-0.5">Pro</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        <p className="px-2 mb-2 label-mono text-text-5 dark:text-text-5-dark">
          Navigation
        </p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={clsx(
                "flex items-center gap-3 w-full px-3 py-2 text-[13px] font-medium transition-all duration-150 text-left",
                "rounded-[var(--radius-sm)]",
                active
                  ? "text-accent dark:text-accent-dark border-l-2 border-accent dark:border-accent-dark pl-[10px] bg-accent-subtle dark:bg-accent-dim"
                  : "text-text-2 dark:text-text-2-dark border-l-2 border-transparent pl-[10px] hover:bg-bg-elevated dark:hover:bg-bg-elevated-dark hover:text-text dark:hover:text-text-dark"
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.1 : 1.6}
                className={active ? "text-accent dark:text-accent-dark" : "text-text-4 dark:text-text-4-dark"} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        <div className="h-px bg-border dark:bg-border-dark mx-2 mb-1" />
        <div className="flex items-center justify-between px-2">
          <button onClick={toggleTheme}
            className="flex items-center gap-1.5 text-[11px] text-text-3 dark:text-text-3-dark hover:text-text-2 dark:hover:text-text-2-dark transition-colors"
            title={isDark ? "Switch to light" : "Switch to dark"}>
            {isDark ? <Moon size={13} strokeWidth={1.6} /> : <Sun size={13} strokeWidth={1.6} />}
            <span>{isDark ? "Dark" : "Light"}</span>
          </button>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-text-4 dark:text-text-4-dark hover:text-accent dark:hover:text-accent-dark transition-colors"
            title="View on GitHub">
            <GitBranch size={11} strokeWidth={1.6} />
            v{VERSION}
          </a>
        </div>
      </div>
    </aside>
  );
}
