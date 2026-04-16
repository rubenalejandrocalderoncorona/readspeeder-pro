"use client";

import React, { useState } from "react";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { MacCard, MacButton } from "@/components/macos/MacUI";
import { FileUploader } from "@/components/reader/FileUploader";
import { useAppStore } from "@/store/useAppStore";
import { segmentIntoPhrases, divideIntoExercises } from "@/lib/parser";

// Sample classic titles bundled for demo
const SAMPLE_CLASSICS = [
  { title: "Pride and Prejudice", author: "Jane Austen", wordCount: 122189, excerpt: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters." },
  { title: "Moby Dick", author: "Herman Melville", wordCount: 206052, excerpt: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", wordCount: 47094, excerpt: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had. He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that." },
  { title: "1984", author: "George Orwell", wordCount: 88942, excerpt: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him." },
];

export default function LibraryView() {
  const library           = useAppStore((s) => s.library);
  const addLibraryText    = useAppStore((s) => s.addLibraryText);
  const removeLibraryText = useAppStore((s) => s.removeLibraryText);
  const maxPhrase         = useAppStore((s) => s.settings.maxPhrase);
  const setPhrases        = useAppStore((s) => s.setPhrases);
  const setSelectedTextId = useAppStore((s) => s.setSelectedTextId);
  const selectedTextId    = useAppStore((s) => s.selectedTextId);

  const [showAddText, setShowAddText] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  const loadText = (id: string, content: string) => {
    const ps = segmentIntoPhrases(content, { maxWords: maxPhrase });
    const exercises = divideIntoExercises(ps);
    setPhrases(exercises[0] ?? ps);
    setSelectedTextId(id);
  };

  const addSample = (sample: typeof SAMPLE_CLASSICS[0]) => {
    addLibraryText({
      title: sample.title,
      author: sample.author,
      content: sample.excerpt,
      wordCount: sample.wordCount,
      source: "classic",
    });
  };

  const saveCustomText = () => {
    if (!newText.trim()) return;
    const wordCount = newText.trim().split(/\s+/).length;
    addLibraryText({
      title: newTitle || "Custom Text",
      content: newText.trim(),
      wordCount,
      source: "user",
    });
    setNewTitle("");
    setNewText("");
    setShowAddText(false);
  };

  const allItems = library;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Library</h2>
        <MacButton size="sm" variant="primary" onClick={() => setShowAddText((v) => !v)}>
          <Plus size={13} className="mr-1" /> Add Text
        </MacButton>
      </div>

      {/* Upload */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-widest">Upload File</p>
        <FileUploader />
      </div>

      {/* Custom text entry */}
      {showAddText && (
        <MacCard>
          <div className="p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enter Your Own Text</h3>
            <input
              type="text"
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-mac text-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] outline-none focus:ring-1 focus:ring-mac-blue text-gray-800 dark:text-gray-200"
            />
            <textarea
              placeholder="Paste or enter text here…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-mac text-sm border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] outline-none focus:ring-1 focus:ring-mac-blue resize-none text-gray-800 dark:text-gray-200 reader-text"
            />
            <div className="flex gap-2">
              <MacButton variant="primary" size="sm" onClick={saveCustomText}>Save</MacButton>
              <MacButton variant="ghost" size="sm" onClick={() => setShowAddText(false)}>Cancel</MacButton>
            </div>
          </div>
        </MacCard>
      )}

      {/* Classic samples */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-widest">Classic Titles</p>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_CLASSICS.map((s) => {
            const alreadyAdded = library.some((l) => l.title === s.title);
            return (
              <MacCard key={s.title}>
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{s.author}</div>
                    </div>
                    <BookOpen size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{s.wordCount.toLocaleString()} words</div>
                  {alreadyAdded ? (
                    <MacButton size="sm" variant="ghost" disabled>Added</MacButton>
                  ) : (
                    <MacButton size="sm" variant="secondary" onClick={() => addSample(s)}>Add to Library</MacButton>
                  )}
                </div>
              </MacCard>
            );
          })}
        </div>
      </div>

      {/* User library */}
      {allItems.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-widest">Your Library</p>
          <div className="flex flex-col gap-1">
            {allItems.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-mac border transition-all cursor-pointer",
                  selectedTextId === item.id
                    ? "bg-mac-blue border-mac-blue text-white"
                    : "bg-white dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06]"
                )}
                onClick={() => loadText(item.id, item.content)}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  {item.author && <div className="text-xs opacity-60 truncate">{item.author}</div>}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs opacity-60">{item.wordCount.toLocaleString()}w</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLibraryText(item.id); }}
                    className={clsx(
                      "opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity p-1 rounded",
                      selectedTextId === item.id ? "hover:bg-white/20" : "hover:bg-black/[0.06]"
                    )}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
