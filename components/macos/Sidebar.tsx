"use client";

import React from "react";
import { BookOpen, BarChart2, Wrench, Library, HelpCircle } from "lucide-react";
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

export function Sidebar() {
  const activeView   = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);

  return (
    <aside className="w-52 shrink-0 flex flex-col mac-vibrancy border-r border-black/[0.07] dark:border-white/[0.06] select-none">
      {/* Brand */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-mac-blue flex items-center justify-center shadow-[0_2px_8px_rgba(0,122,255,0.4)]">
          <BookOpen size={15} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-none">ReadSpeeder</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Pro</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-black/[0.06] dark:bg-white/[0.06] mb-2" />

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={clsx(
                "flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-[8px] text-[13px] font-medium transition-all duration-100 text-left",
                active
                  ? "bg-mac-blue text-white shadow-[0_1px_3px_rgba(0,122,255,0.3)]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
              )}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-white" : "text-gray-400 dark:text-gray-500"}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <p className="pb-4 text-center text-[10px] text-gray-300 dark:text-gray-600">v1.0.0</p>
    </aside>
  );
}
