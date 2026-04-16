"use client";

import React from "react";
import { MacCard } from "@/components/macos/MacUI";

const sections = [
  {
    title: "Getting Started",
    content: `Upload a .txt, .pdf, or .epub file in the Library tab, then select it to begin. Navigate to Lessons and press Start to begin reading.`,
  },
  {
    title: "Lessons 1–4: Stationary Phrase",
    content: `Each phrase is displayed one at a time in the center of the screen. Press Space, →, or click "Next Phrase" to advance. Lessons 1–3 progressively reduce assistance. Lesson 4 auto-advances at 20% above your average speed, then lets you re-read manually.`,
  },
  {
    title: "Lessons 5–8: Horizontal Scanning",
    content: `Phrases appear in a left-to-right scanning pattern, like normal reading. A highlight moves from phrase to phrase. Lesson 8 is the double-pass version. Each phrase appears on its own line without wrapping.`,
  },
  {
    title: "Lessons 9–12: Black & Gray",
    content: `Active phrases show in black; others in gray. No highlight—your eyes guide you. Lesson 10 uses Focus Dots©. Lessons 11–12 allow phrases to wrap across lines. Lesson 12 is the double-pass version.`,
  },
  {
    title: "Concentration Score",
    content: `Lessons 1–8 measure concentration. The score compares how closely your reading time matches the length of each phrase. A concentrating reader's time correlates with phrase length; a distracted reader's timing is mechanical (metronome-like). Aim for 50%+ to confirm you're reading for meaning.`,
  },
  {
    title: "Net WPM",
    content: `Net WPM = WPM × Concentration Score. This is the meaningful reading speed — raw speed adjusted for actual comprehension effort. Shown in the Progress chart.`,
  },
  {
    title: "Unlocking Lessons",
    content: `Each lesson unlocks after completing 15 exercises in the previous lesson. You can preview any lesson, but it will show as locked until unlocked.`,
  },
  {
    title: "Max Phrase (Tools)",
    content: `Controls how many words appear per phrase. Auto Set adjusts based on your speed: 3 words (<300 WPM), 4 words (300–499), 5 words (500–599), 6 words (600–699), 7 words (700+). You can disable Auto Set for manual control.`,
  },
  {
    title: "Speed Comparison (Tools)",
    content: `Visually compare two reading speeds. Defaults to ±10% of your most recent speed. Adjust with arrows or click Reset to return to defaults.`,
  },
  {
    title: "Reading Timer (Tools)",
    content: `Time your regular book reading. Enter the characters per line and lines per page. Click Time Stamp (or Space) at each page turn. Colors indicate performance: green = 10%+ above your ReadSpeeder speed, red = 10%+ below, yellow = within ±10%.`,
  },
];

export default function HelpView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-4 gap-4">
      <h2 className="text-lg font-semibold text-ink dark:text-white/90">Help & Instructions</h2>
      <div className="flex flex-col gap-3">
        {sections.map((s) => (
          <MacCard key={s.title}>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-ink dark:text-white/80 mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink-3 dark:text-white/40 leading-relaxed">{s.content}</p>
            </div>
          </MacCard>
        ))}
      </div>
    </div>
  );
}
