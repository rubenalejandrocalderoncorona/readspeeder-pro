// Concentration score calculation
// Compares per-phrase time vs expected time based on character count

export interface PhraseTimingData {
  phrase: string;
  durationMs: number;
}

// Natural cadence: reading speed means time should scale with phrase length.
// We correlate actual per-character time against expected per-character time.
// Score = 1 - (stdDev of normalized residuals / stdDev ceiling).
export function calculateConcentrationScore(timings: PhraseTimingData[]): number {
  if (timings.length < 3) return 100;

  const charCounts = timings.map((t) => t.phrase.replace(/\s/g, "").length || 1);
  const durations = timings.map((t) => t.durationMs);

  // Expected duration for each phrase (proportional to char count)
  const totalChars = charCounts.reduce((a, b) => a + b, 0);
  const totalTime = durations.reduce((a, b) => a + b, 0);
  const msPerChar = totalTime / totalChars;

  const expected = charCounts.map((c) => c * msPerChar);

  // Normalized residuals: (actual - expected) / expected
  const residuals = durations.map((d, i) => (d - expected[i]) / expected[i]);

  // Standard deviation of residuals
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const variance = residuals.reduce((a, b) => a + (b - mean) ** 2, 0) / residuals.length;
  const stdDev = Math.sqrt(variance);

  // A perfectly mechanical reader (metronome-like) has stdDev ~ 0 relative to expected,
  // meaning every phrase gets the same time regardless of length → residuals cluster near 0.
  // A concentrating reader has residuals that correlate with length (stdDev is higher but structured).
  // We measure structural variance: if residuals correlate with length, score is high.

  const lengthNorm = charCounts.map((c) => (c - totalChars / charCounts.length) / (totalChars / charCounts.length));
  const lengthMean = lengthNorm.reduce((a, b) => a + b, 0) / lengthNorm.length;

  // Pearson correlation between residuals and char counts
  const cov =
    residuals.reduce((sum, r, i) => sum + (r - mean) * (lengthNorm[i] - lengthMean), 0) / residuals.length;
  const sdR = stdDev || 1e-9;
  const sdL = Math.sqrt(lengthNorm.reduce((a, b) => a + (b - lengthMean) ** 2, 0) / lengthNorm.length) || 1e-9;
  const correlation = cov / (sdR * sdL);

  // Score: correlation mapped to 0-100, clamped
  const score = Math.round(((correlation + 1) / 2) * 100);
  return Math.max(0, Math.min(100, score));
}

// Calculate WPM from word count and duration
export function calculateWpm(wordCount: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return Math.round((wordCount / durationMs) * 60_000);
}

// Auto-speed: 20% above average of last 3 WPM readings
export function calculateAutoSpeed(recentWpms: number[]): number {
  const last3 = recentWpms.slice(-3);
  if (!last3.length) return 200;
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
  return Math.round(avg * 1.2);
}

// Convert WPM to ms-per-phrase for a given phrase
export function wpmToMsPerPhrase(wpm: number, phrase: string): number {
  if (wpm <= 0) return 1000;
  const wordCount = phrase.trim().split(/\s+/).length;
  return Math.round((wordCount / wpm) * 60_000);
}
