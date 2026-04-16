"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { parseTxt, parseFileViaApi, segmentIntoPhrases, divideIntoExercises } from "@/lib/parser";
import { useAppStore } from "@/store/useAppStore";

export function FileUploader({ onLoaded }: { onLoaded?: (n: number) => void }) {
  const [isDragging,    setIsDragging]    = useState(false);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [fileName,      setFileName]      = useState<string | null>(null);
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
            ? "border-mac-blue bg-blue-50 dark:bg-blue-950/20 scale-[1.01]"
            : "border-black/[0.10] dark:border-white/[0.10] hover:border-mac-blue/50 hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
        )}
      >
        <input ref={inputRef} type="file" accept=".txt,.pdf,.epub" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }} />
        {isProcessing
          ? <div className="w-5 h-5 border-2 border-mac-blue border-t-transparent rounded-full animate-spin" />
          : <Upload size={20} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
        }
        <div className="text-[13px] text-gray-500 dark:text-gray-400 text-center">
          {isProcessing ? "Processing…" : fileName
            ? <span className="flex items-center gap-1.5 text-mac-green font-medium"><FileText size={13} />{fileName}</span>
            : <><span className="text-mac-blue font-medium">Choose a file</span> or drag it here</>
          }
        </div>
        <p className="text-[11px] text-gray-300 dark:text-gray-600">.txt · .pdf · .epub</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-mac-red text-[12px]">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}
