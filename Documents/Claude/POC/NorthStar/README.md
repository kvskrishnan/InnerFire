# ✦ NorthStar

> Don't track your habits. Become the person you were meant to be.

NorthStar is an offline-first Progressive Web App — a **Personal Life Operating System** that helps you continuously align daily decisions with the future person you want to become.

It is not a habit tracker, todo app, or productivity dashboard. It is a private coach, mentor, and future-self mirror.

## Core Philosophy

- Identity before habits
- Purpose before productivity
- Reflection before statistics
- Emotion before numbers
- Privacy before cloud
- Growth before perfection

## Features

| Feature | Description |
|---|---|
| Morning Ritual | Full-screen Vision Card to start the day with intention |
| Life Dashboard | Calm overview of pillars, goals, mood, and upcoming rituals |
| Identity Builder | Define who you are becoming — not just what you want to do |
| Life Pillars | 8 life domains: Health, Mind, Career, Wealth, Relationships, Spirituality, Personal Growth, Contribution |
| Goals with WHY | Every goal requires a meaningful WHY — the WHY powers reminders and Emergency Mode |
| Night Reflection | Reflective end-of-day prompts — not statistics |
| Journal | Private, local, searchable. Text, mood, tags, pillar links |
| Motivation Vault | Quotes and assets that move you — shown in Emergency Mode |
| Future Letters | Write sealed letters to your future self |
| Emergency Mode | One-tap sanctuary for low-motivation moments |
| Life Timeline | Optional visual of years lived vs ahead |
| Sample Data | Explore immediately with a pre-built persona (Alex Chen) |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Validation | Zod + React Hook Form |
| Animation | Framer Motion |
| PWA | vite-plugin-pwa + Workbox |
| Security | Web Crypto API (PBKDF2) |
| Tests | Vitest + Playwright |

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+

### Install
```bash
git clone <repo-url>
cd NorthStar
npm install
```

### Run (development)
```bash
npm run dev
```
Open `http://localhost:5200`

### Build (production)
```bash
npm run build
npm run preview
```

### Test
```bash
# Unit tests
npm run test

# E2E tests (requires dev server running)
npx playwright test
```

## Privacy Model

NorthStar is built on a strict privacy-first architecture:

- **No backend** — the app has no server-side component
- **No account required** — nothing to sign up for
- **No analytics** — no tracking scripts, no telemetry
- **No cloud sync** — all data lives in your browser's IndexedDB
- **PIN protection** — optional 4-digit PIN hashed with PBKDF2 (100,000 iterations, SHA-256)
- **Export/Import** — you own your data; export as JSON anytime

### What stays on your device
- Your mission, vision, and personal WHY
- All goals, reflections, and journal entries
- Identity statements and life pillars
- Future letters
- Motivation vault items

### What is never collected
- Everything above

## Architecture

```
src/
  app/          # App shell, router, providers
  components/   # UI components (ui/, layout/, vision/, onboarding/, identity/, etc.)
  db/           # Dexie schema, repositories (one per entity)
  domain/       # (reserved for future domain logic)
  hooks/        # Shared React hooks (useVisionData, etc.)
  lib/          # Utilities: crypto, dates, notifications, validation
  screens/      # One file per route (20 screens)
  seed/         # Sample data for demo mode
  stores/       # Zustand stores (auth, app, onboarding)
  tests/        # Vitest unit tests + Playwright E2E
```

### Data flow
```
User action → React component → Repository → Dexie (IndexedDB)
                              ↓
                         Zustand store (UI state only)
```

Zustand holds only transient UI state (lock state, demo mode, active ritual). All persistent data goes through Dexie repositories.

## Known Limitations

- **Notifications**: Browser Notification API is used for same-session reminders. For persistent background notifications (e.g. after the app is closed), a Service Worker push subscription and backend push service would be required — this is on the AI features roadmap.
- **Blob storage**: Photos and audio in the Motivation Vault and Journal are referenced by IndexedDB blob entries. Large media files may impact IndexedDB storage quotas on some browsers.
- **Biometric unlock**: WebAuthn biometric unlock is designed but not implemented in MVP — PIN is the only lock mechanism.
- **Export of blobs**: Binary data (photos, audio) is excluded from JSON export/import. Text data exports cleanly.
- **No cross-device sync**: Data is per-browser. To move data, use Export → Import.
- **Service worker caching**: First load requires internet; subsequent loads work offline.

## Roadmap

- [ ] AI Future Self (voice conversation with a version of yourself)
- [ ] AI Coach (weekly review and goal suggestions)
- [ ] AI Journal Summary
- [ ] WebAuthn biometric unlock
- [ ] Cross-device sync (opt-in, end-to-end encrypted)
- [ ] Native app (Capacitor/Tauri wrapper)
- [ ] Voice journal entries

## Licence

MIT
