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

async function openNativeFilePicker(): Promise<string | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    multiple: false,
    filters: [{ name: "Book", extensions: ["txt", "pdf", "epub"] }],
  });
  if (!selected) return null;
  // selected is a string (file path) in Tauri v2
  return typeof selected === "string" ? selected : null;
}

function isTauri() {
  return typeof window !== "undefined" && "isTauri" in window;
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

  const processTauriPath = useCallback(async (filePath: string) => {
    setIsProcessing(true);
    setError(null);
    setFileName(filePath.split(/[\\/]/).pop() ?? filePath);
    try {
      const result = await invokeParseNative(filePath, maxPhrase);
      const firstExercise = result.exercises[0] ?? result.phrases;
      const title = (filePath.split(/[\\/]/).pop() ?? filePath).replace(/\.[^.]+$/, "");
      addLibraryText({
        title,
        content: firstExercise.join(" "),
        wordCount: result.wordCount,
        source: "user",
      });
      setPhrases(firstExercise);
      onLoaded?.(result.exercises.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsProcessing(false);
    }
  }, [addLibraryText, setPhrases, maxPhrase, onLoaded]);

  const processWebFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  }, [addLibraryText, setPhrases, maxPhrase, onLoaded]);

  const handleClick = useCallback(async () => {
    if (isTauri()) {
      // Use native dialog to get a real file path
      try {
        const filePath = await openNativeFilePicker();
        if (filePath) await processTauriPath(filePath);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to open file dialog");
      }
    } else {
      inputRef.current?.click();
    }
  }, [processTauriPath]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (isTauri()) {
      // Drag-drop in Tauri: file.path may or may not be set
      const nativePath = (f as File & { path?: string }).path;
      if (nativePath) {
        await processTauriPath(nativePath);
      } else {
        setError("Drag-and-drop is not supported in the app — use the Open button instead.");
      }
    } else {
      await processWebFile(f);
    }
  }, [processTauriPath, processWebFile]);

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "border-2 border-dashed rounded-[12px] p-7 flex flex-col items-center gap-2.5 cursor-pointer transition-all duration-150",
          isDragging
            ? "border-accent bg-accent/[0.04] scale-[1.01]"
            : "border-border dark:border-border-dark hover:border-accent/50 dark:hover:border-accent-dark/50 hover:bg-bg-elevated dark:hover:bg-bg-elevated-dark"
        )}
      >
        {/* Hidden input only used in browser mode */}
        <input ref={inputRef} type="file" accept=".txt,.pdf,.epub" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processWebFile(f); }} />
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
