"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { parseTxt, parseFileViaApi, segmentIntoPhrases, divideIntoExercises } from "@/lib/parser";
import { useAppStore } from "@/store/useAppStore";

// Tauri invoke — dynamically imported so the module doesn't crash in the browser.
async function invokeParseNative(filePath: string, maxWords: number) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<{ phrases: string[]; exercises: string[][]; wordCount: number }>(
    "parse_and_segment",
    { filePath, maxWords }
  );
}

function isTauri() {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function FileUploader({ onLoaded }: { onLoaded?: (n: number) => void }) {
  const [isDragging,   setIsDragging]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [fileName,     setFileName]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLibraryText    = useAppStore((s) => s.addLibraryText);
  const setPhrases        = useAppStore((s) => s.setPhrases);
  const maxPhrase         = useAppStore((s) => s.settings.maxPhrase);

  const process = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (isTauri() && (ext === "pdf" || ext === "epub")) {
        // ── Tauri path: native Rust parser ───────────────────────────────
        // Tauri gives us the real file path via the file object's path property.
        const nativePath = (file as File & { path?: string }).path;
        if (!nativePath) throw new Error("Cannot read file path — please re-open from disk.");

        const result = await invokeParseNative(nativePath, maxPhrase);
        const firstExercise = result.exercises[0] ?? result.phrases;
        // Store content stub for library (full content not returned; store title only)
        addLibraryText({
          title: file.name.replace(/\.[^.]+$/, ""),
          content: firstExercise.join(" "),
          wordCount: result.wordCount,
          source: "user",
        });
        setPhrases(firstExercise);
        onLoaded?.(result.exercises.length);
      } else {
        // ── Web / TXT path ───────────────────────────────────────────────
        let parsed: { title: string; content: string; wordCount: number };
        if (ext === "txt") {
          parsed = parseTxt(await file.text());
        } else if (ext === "pdf" || ext === "epub") {
          parsed = await parseFileViaApi(file);
        } else {
          throw new Error("Unsupported format — use .txt, .pdf, or .epub");
        }
        const phrases   = segmentIntoPhrases(parsed.content, { maxWords: maxPhrase });
        const exercises = divideIntoExercises(phrases);
        addLibraryText({ title: parsed.title, content: parsed.content, wordCount: parsed.wordCount, source: "user" });
        setPhrases(exercises[0] ?? phrases);
        onLoaded?.(exercises.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  }, [addLibraryText, setPhrases, maxPhrase, onLoaded]);

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) process(f); }}
        className={clsx(
          "border-2 border-dashed rounded-[12px] p-7 flex flex-col items-center gap-2.5 cursor-pointer transition-all duration-150",
          isDragging
            ? "border-accent bg-accent/[0.04] scale-[1.01]"
            : "border-border dark:border-border-dark hover:border-accent/50 dark:hover:border-accent-dark/50 hover:bg-bg-elevated dark:hover:bg-bg-elevated-dark"
        )}
      >
        <input ref={inputRef} type="file" accept=".txt,.pdf,.epub" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }} />
        {isProcessing
          ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          : <Upload size={20} className="text-text-5 dark:text-text-5-dark" strokeWidth={1.5} />
        }
        <div className="text-[13px] text-text-3 dark:text-text-3-dark text-center">
          {isProcessing ? "Processing…" : fileName
            ? <span className="flex items-center gap-1.5 text-ok font-medium"><FileText size={13} />{fileName}</span>
            : <><span className="text-accent font-medium">Choose a file</span> or drag it here</>
          }
        </div>
        <p className="text-[11px] text-text-5 dark:text-text-5-dark">.txt · .pdf · .epub</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px] bg-danger/5 dark:bg-danger/10 border border-danger/20 text-danger text-[12px]">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}
