// Pure phrase-segmentation and text parsing utilities

export interface ParsedText {
  title: string;
  content: string;
  wordCount: number;
}

export interface PhraseSegmentOptions {
  maxWords: number;        // Max Phrase setting (3-7)
  breakOnPunctuation: boolean;
  targetExerciseWords: number; // ~800 words per exercise
}

const DEFAULT_OPTIONS: PhraseSegmentOptions = {
  maxWords: 3,
  breakOnPunctuation: true,
  targetExerciseWords: 800,
};

// Break text into phrases — pure function for easy testing
export function segmentIntoPhrases(text: string, options: Partial<PhraseSegmentOptions> = {}): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const words = text
    .replace(/\r\n/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const phrases: string[] = [];
  let current: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    current.push(word);

    const atMax = current.length >= opts.maxWords;
    const endsClause = opts.breakOnPunctuation && /[.!?;:,—–]$/.test(word);
    const nextIsCapitalized = i + 1 < words.length && /^[A-Z]/.test(words[i + 1]);
    const strongBreak = opts.breakOnPunctuation && /[.!?]$/.test(word) && nextIsCapitalized;

    if (atMax || strongBreak) {
      phrases.push(current.join(" "));
      current = [];
    } else if (endsClause && current.length >= Math.max(2, opts.maxWords - 1)) {
      phrases.push(current.join(" "));
      current = [];
    }
  }

  if (current.length) phrases.push(current.join(" "));
  return phrases.filter((p) => p.trim().length > 0);
}

// Divide phrases into exercises of ~800 words
export function divideIntoExercises(phrases: string[], targetWords = 800): string[][] {
  const exercises: string[][] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const phrase of phrases) {
    const pw = phrase.split(" ").length;
    current.push(phrase);
    wordCount += pw;

    if (wordCount >= targetWords) {
      exercises.push(current);
      current = [];
      wordCount = 0;
    }
  }
  if (current.length) exercises.push(current);
  return exercises;
}

// Clean raw text of common artifacts
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
    .replace(/\u00AD/g, "")           // soft hyphen
    .replace(/([a-z])-\n([a-z])/g, "$1$2") // de-hyphenate line wraps
    .replace(/\n{3,}/g, "\n\n")       // collapse excess blank lines
    .trim();
}

// Count words in a string
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Parse plain text file
export function parseTxt(content: string): ParsedText {
  const cleaned = cleanText(content);
  const lines = cleaned.split("\n");
  const title = lines[0].trim().slice(0, 80) || "Untitled";
  return {
    title,
    content: cleaned,
    wordCount: countWords(cleaned),
  };
}

// Parse PDF or EPUB via the /api/parse server route (avoids bundling Node.js modules)
export async function parseFileViaApi(file: File): Promise<ParsedText> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/parse", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  return res.json() as Promise<ParsedText>;
}
