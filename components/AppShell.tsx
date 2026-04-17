"use client";

import React, { useEffect } from "react";
import { TitleBar } from "@/components/macos/TitleBar";
import { Sidebar } from "@/components/macos/Sidebar";
import { useAppStore } from "@/store/useAppStore";
import LessonsView from "@/components/reader/LessonsView";
import ProgressView from "@/components/charts/ProgressView";
import ToolsView from "@/components/reader/ToolsView";
import LibraryView from "@/components/reader/LibraryView";
import HelpView from "@/components/reader/HelpView";

export default function AppShell() {
  const activeView = useAppStore((s) => s.activeView);
  const theme      = useAppStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (theme === "dark")  { apply(true);  return; }
    if (theme === "light") { apply(false); return; }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches);
    const cb = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, [theme]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg dark:bg-bg-dark relative">
      <div className="grain" aria-hidden />
      <TitleBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-bg dark:bg-bg-dark">
          {activeView === "lessons"  && <LessonsView />}
          {activeView === "progress" && <ProgressView />}
          {activeView === "tools"    && <ToolsView />}
          {activeView === "library"  && <LibraryView />}
          {activeView === "help"     && <HelpView />}
        </main>
      </div>
    </div>
  );
}
