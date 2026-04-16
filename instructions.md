# ReadSpeeder Pro — Build & Run Guide

## Prerequisites
- Node.js 20+, npm 10+
- Rust + Cargo (for Tauri native build)
- Docker (for containerized web build)

---

## Web App (Next.js)

### Development
```bash
cd readspeeder-pro
npm install
npm run dev          # http://localhost:3000
```

### Production build
```bash
npm run build
npm start
```

---

## Docker (containerized web)

```bash
# Build image (~150 MB with node:22-alpine)
docker build -t readspeeder-pro .

# Run
docker run -p 3000:3000 readspeeder-pro
# Open http://localhost:3000
```

---

## macOS Native App (Tauri)

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Install Tauri CLI
cargo install tauri-cli
# Or via npm
npm install -g @tauri-apps/cli
```

### Dev (hot reload)
```bash
npm run tauri dev
```

### Build .app bundle
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/macos/ReadSpeeder Pro.app
```

Add to `package.json` scripts:
```json
{
  "tauri": "tauri",
  "tauri:dev": "tauri dev",
  "tauri:build": "tauri build"
}
```

---

## Project Structure

```
readspeeder-pro/
├── app/
│   ├── api/parse/route.ts    # PDF/EPUB parsing API (server-side)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AppShell.tsx           # Root layout, theme switcher
│   ├── macos/
│   │   ├── TitleBar.tsx       # macOS traffic lights + title
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── MacUI.tsx          # Button, Card, Badge, ProgressBar
│   ├── reader/
│   │   ├── LessonsView.tsx    # 12-lesson reader UI
│   │   ├── PhraseDisplay.tsx  # Stationary/Horizontal/BlackGray renderers
│   │   ├── ReaderController.tsx  # Controls, progress, countdown
│   │   ├── FileUploader.tsx   # Drag-drop file upload
│   │   ├── ToolsView.tsx      # Settings, Speed Comparison, Timer
│   │   ├── LibraryView.tsx    # Text library management
│   │   └── HelpView.tsx       # Instructions
│   └── charts/
│       └── ProgressView.tsx   # Recharts progress dashboard
├── hooks/
│   └── useSpeedReader.ts      # Core reading loop + timing
├── lib/
│   ├── parser.ts              # Text parsing + phrase segmentation (pure)
│   ├── concentration.ts       # Concentration score algorithm (pure)
│   └── lessons.ts             # 12-lesson config definitions
├── store/
│   └── useAppStore.ts         # Zustand state (persisted)
├── src-tauri/                 # Rust/Tauri native config
├── Dockerfile
├── next.config.ts
└── tailwind.config.ts
```

---

## Key Features

| Feature | Implementation |
|---------|---------------|
| 12 lessons | `lib/lessons.ts` + `LessonsView.tsx` |
| Phrase segmentation | `lib/parser.ts::segmentIntoPhrases()` (pure fn) |
| Concentration Score | `lib/concentration.ts::calculateConcentrationScore()` |
| Auto-advance (L4/8/12) | `hooks/useSpeedReader.ts` RAF loop |
| PDF/EPUB parsing | `app/api/parse/route.ts` (server-side) |
| Progress charts | `components/charts/ProgressView.tsx` |
| Persistent state | Zustand + localStorage |
| macOS aesthetics | Tailwind custom theme + `mac-vibrancy` class |

---

## Concentration Score Algorithm

The score measures how closely reading time correlates with phrase length.
A focused reader takes proportionally more time on longer phrases; a distracted
reader has metronome-like uniform timing regardless of phrase length.

Computed as: **Pearson correlation(timing residuals, normalized char counts) → 0–100%**

See `lib/concentration.ts` for the full implementation.
