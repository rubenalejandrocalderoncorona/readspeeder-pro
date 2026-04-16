import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LessonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ExerciseResult {
  id: string;
  lessonId: LessonId;
  exerciseIndex: number;
  date: string;
  wpm: number;
  concentrationScore: number; // 0-100
  netWpm: number;
  wordCount: number;
  durationMs: number;
  phraseTimes: number[]; // ms per phrase
}

export interface LessonProgress {
  lessonId: LessonId;
  completedExercises: number;
  unlocked: boolean;
  bestWpm: number;
  bestConcentration: number;
}

export interface UserSettings {
  maxPhrase: number;        // 3-7
  autoSetPhrase: boolean;
  useSerif: boolean;
  theme: "light" | "dark" | "system";
  recentSpeed: number;      // last recorded WPM
}

export interface LibraryText {
  id: string;
  title: string;
  author?: string;
  content: string;
  wordCount: number;
  addedAt: string;
  source: "user" | "classic";
}

export interface AppState {
  // Navigation
  activeView: "lessons" | "progress" | "tools" | "library" | "help";
  activeLessonId: LessonId;
  activeExerciseIndex: number;

  // Reading session
  isReading: boolean;
  selectedTextId: string | null;
  phrases: string[];
  currentPhraseIndex: number;

  // Progress
  lessonProgress: LessonProgress[];
  exerciseHistory: ExerciseResult[];

  // Settings
  settings: UserSettings;

  // Library
  library: LibraryText[];

  // Actions
  setActiveView: (view: AppState["activeView"]) => void;
  setActiveLesson: (id: LessonId) => void;
  setActiveExercise: (idx: number) => void;
  setIsReading: (v: boolean) => void;
  setPhrases: (phrases: string[]) => void;
  setCurrentPhraseIndex: (idx: number) => void;
  setSelectedTextId: (id: string | null) => void;
  recordExercise: (result: Omit<ExerciseResult, "id" | "date">) => void;
  resetProgress: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  addLibraryText: (text: Omit<LibraryText, "id" | "addedAt">) => void;
  removeLibraryText: (id: string) => void;
  getLessonProgress: (id: LessonId) => LessonProgress;
}

const defaultLessonProgress = (): LessonProgress[] =>
  Array.from({ length: 12 }, (_, i) => ({
    lessonId: (i + 1) as LessonId,
    completedExercises: 0,
    unlocked: i === 0, // only lesson 1 starts unlocked
    bestWpm: 0,
    bestConcentration: 0,
  }));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeView: "lessons",
      activeLessonId: 1,
      activeExerciseIndex: 0,
      isReading: false,
      selectedTextId: null,
      phrases: [],
      currentPhraseIndex: 0,
      lessonProgress: defaultLessonProgress(),
      exerciseHistory: [],
      settings: {
        maxPhrase: 3,
        autoSetPhrase: true,
        useSerif: false,
        theme: "system",
        recentSpeed: 0,
      },
      library: [],

      setActiveView: (view) => set({ activeView: view }),
      setActiveLesson: (id) => set({ activeLessonId: id }),
      setActiveExercise: (idx) => set({ activeExerciseIndex: idx }),
      setIsReading: (v) => set({ isReading: v }),
      setPhrases: (phrases) => set({ phrases, currentPhraseIndex: 0 }),
      setCurrentPhraseIndex: (idx) => set({ currentPhraseIndex: idx }),
      setSelectedTextId: (id) => set({ selectedTextId: id }),

      recordExercise: (result) => {
        const id = `ex-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const date = new Date().toISOString();
        const full: ExerciseResult = { ...result, id, date };

        set((state) => {
          const history = [...state.exerciseHistory, full];
          const progress = state.lessonProgress.map((lp) => {
            if (lp.lessonId !== result.lessonId) return lp;
            const completed = lp.completedExercises + 1;
            return {
              ...lp,
              completedExercises: completed,
              bestWpm: Math.max(lp.bestWpm, result.wpm),
              bestConcentration: Math.max(lp.bestConcentration, result.concentrationScore),
            };
          });

          // Unlock next lesson every 15 completed exercises
          const updated = progress.map((lp) => {
            const prevLesson = progress.find((p) => p.lessonId === lp.lessonId - 1);
            if (prevLesson && prevLesson.completedExercises >= 15) {
              return { ...lp, unlocked: true };
            }
            return lp;
          });

          // Auto-set Max Phrase based on speed
          const newSettings = { ...state.settings, recentSpeed: result.wpm };
          if (state.settings.autoSetPhrase) {
            const wpm = result.wpm;
            let maxPhrase = 3;
            if (wpm >= 700) maxPhrase = 7;
            else if (wpm >= 600) maxPhrase = 6;
            else if (wpm >= 500) maxPhrase = 5;
            else if (wpm >= 300) maxPhrase = 4;
            newSettings.maxPhrase = maxPhrase;
          }

          return { exerciseHistory: history, lessonProgress: updated, settings: newSettings };
        });
      },

      resetProgress: () =>
        set({ exerciseHistory: [], lessonProgress: defaultLessonProgress(), settings: { ...get().settings, recentSpeed: 0 } }),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      addLibraryText: (text) => {
        const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const addedAt = new Date().toISOString();
        set((state) => ({ library: [...state.library, { ...text, id, addedAt }] }));
      },

      removeLibraryText: (id) =>
        set((state) => ({ library: state.library.filter((l) => l.id !== id) })),

      getLessonProgress: (id) => {
        return get().lessonProgress.find((lp) => lp.lessonId === id) ?? {
          lessonId: id,
          completedExercises: 0,
          unlocked: id === 1,
          bestWpm: 0,
          bestConcentration: 0,
        };
      },
    }),
    {
      name: "readspeeder-pro",
      partialize: (state) => ({
        lessonProgress: state.lessonProgress,
        exerciseHistory: state.exerciseHistory,
        settings: state.settings,
        library: state.library,
        selectedTextId: state.selectedTextId,
        activeLessonId: state.activeLessonId,
      }),
    }
  )
);
