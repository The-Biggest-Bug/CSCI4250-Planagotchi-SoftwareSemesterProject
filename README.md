### plan-a-gotchi

a small desktop planning app with a cute tamagotchi-inspired pet. built as the semester project for Puskar's Software Engineering class.

### team membership

- David - Developer
- Riker & Zee - Project Owners
- Yaretzi - Scrum Master
- Xinke - Quality Assurance

### project overview

plan-a-gotchi helps you plan your day with:
- daily tasks - create/edit/complete
- recurring tasks
- habits - daily habit tracking
- calendar views - monthly/weekly
- pet system - moods, health/xp/evolution, death
- notifications

### vision

make planning feel lightweight and rewarding. you manage tasks and habits, and your pet reflects your progress. the app aims to be quick to use (few clicks), friendly, and offline-first for reliability.

### source code

everything in this repo is the source code for the application, including:
- `src/mainview/` - React UI (pages, components, assets)
- `src/bun/` - Bun runtime code (desktop/notifications integration)
- `src/db/` - local database schema/client (Drizzle + SQLite)
- `src/shared/` - shared RPC/electrobun helpers

### release notes

- changelog - see [CHANGELOG.md](CHANGELOG.md)
- current version - see [package.json](package.json)

### architecture (architectural design document)

this section is the "architectural design document" for submission purposes.

- high-level shape
  - ui - React + Vite + Tailwind (in `src/mainview/`)
  - desktop host - Electrobun (Bun runtime) for native desktop packaging + native capabilities
  - data - local SQLite database accessed via Drizzle ORM (in `src/db/`)
  - cross-boundary calls - ui ↔ runtime communication via shared RPC utilities (in `src/shared/`)

- key runtime responsibilities
  - persist tasks/habits/recurrence state locally (SQLite)
  - schedule/show notifications
  - provide a desktop shell/build pipeline (Electrobun)

- non-functional goals
  - offline-first - local storage
  - fast ui - Vite + React
  - maintainable - typed TypeScript + shared utilities

### detailed design (detailed design document)

this section is the "detailed design document” for submission purposes.

- module breakdown
  - pages - `src/mainview/pages/` (home, tasks, calendar, settings)
  - reusable ui - `src/mainview/components/` and `src/mainview/components/ui/`
  - state/hooks - `src/mainview/hooks/` (task/habit logic lives in hooks)
  - db schema - `src/db/schema.ts`
  - db access - `src/db/client.ts`

- data model (conceptual)
  - task - title/description, due date/time, completion state
  - recurring task - recurrence rule + task instances/occurrences
  - habit - daily habit definition + per-day completion/status
  - pet - type (dino/hamster), mood, health/xp/evolution state

- data flow (at a glance)
  - ui action (create/complete task) → hook/service → db write (Drizzle) → ui refresh
  - time-based triggers (notifications/recurrence) → runtime scheduling → ui indicators/notifications

### user manual

- install/run
  - if you have the packaged app - open it like any desktop app
  - if running from source - see “development environment & setup” below

- basic usage
  - home - see your pet + daily status
  - tasks - create tasks, edit tasks, mark complete
  - calendar - switch monthly/weekly to view scheduled tasks
  - habits - add daily habits and check them off
  - settings - pick pet/background, tweak app preferences

### developer manual

this section is the “developer manual” for submission purposes.

#### glossary

- Bun - JS runtime used for development + the Electrobun host
- Electrobun - desktop app framework used to package and run this app
- Vite - dev server + bundler for the React UI
- Drizzle - ORM used for SQLite access
- HMR - hot module reloading (fast ui iteration via Vite)

#### development environment & setup

- prereqs
  - Bun installed

- install
  - `bun install`

- run (desktop app)
  - `bun run dev`

- run (ui hmr)
  - `bun run dev:hmr`

#### coding standards

- language - TypeScript
- formatting - Prettier
  - format - `bun run format`
  - check - `bun run format:check`
- general
  - prefer small, reusable React components
  - keep db schema changes centralized in `src/db/schema.ts`
  - keep ui-only logic in `src/mainview/` and runtime/desktop logic in `src/bun/`

#### development standards

- branching - use feature branches; merge via pr when possible
- commits - small, descriptive messages
- definition of done (practical)
  - feature works end-to-end
  - no obvious ui regressions
  - formatting passes (`bun run format:check`)
  - changelog/release updated when appropriate

#### data dictionary

the authoritative schema is in `src/db/schema.ts`. at a high level:
- tasks - stored locally with scheduling/completion fields
- habits - stored locally with per-day tracking
- recurrence - stored as rules + derived occurrences/instances (implementation details in code)
- pet state - stored locally (mood/xp/evolution/health)

#### links to design docs

- architectural design document - this README → “architecture”
- detailed design document - this README → “detailed design”

#### test process

- manual testing (primary for this project)
  - create/edit/complete tasks
  - verify recurrence creates the expected future tasks
  - add/check off habits and confirm daily reset behavior
  - confirm notifications appear at expected times
  - verify pet state updates based on task/habit completion

- test plans / scripts
  - for this submission, we keep test scripts lightweight (manual checklist above)
  - if you have automated tests later, add them under a `tests/` folder and document commands here

- test execution tools
  - local run - `bun run dev` (and optionally `bun run dev:hmr` for ui iteration)

#### issue tracking tool

- GitHub Issues - `https://github.com/The-Biggest-Bug/CSCI4250-Planagotchi-SoftwareSemesterProject/issues`

#### project management tool

- GitHub Projects (if enabled) or Issues + Milestones in the repo
  - `https://github.com/The-Biggest-Bug/CSCI4250-Planagotchi-SoftwareSemesterProject`

#### build and deployment (procedure)

- build
  - `bun run build` (Vite build + Electrobun build)
  - `bun run build:prod` (production channel build)

- database
  - push schema - `bun run db:push`
  - db studio - `bun run db:studio`

- deployment
  - produce a packaged Electrobun build and distribute the resulting artifacts (platform-specific)

#### rationale behind specific design decisions

- local SQLite + Drizzle - offline-first reliability; typed queries; simple distribution
- Electrobun + Bun - desktop packaging + runtime integration (notifications, os-level capabilities)
- React + Tailwind - quick ui iteration and consistent styling for a small team project
- rpc/shared helpers - keeps ui/runtime boundaries explicit and easier to maintain

#### troubleshooting guide

- app won’t start / build fails
  - run `bun install` again
  - confirm Bun is installed and on PATH
  - try `bun run build` to surface build errors

- ui hmr not updating
  - use `bun run dev:hmr` and ensure Vite is running on port `5173`

- database issues
  - re-run `bun run db:push`
  - inspect schema in `src/db/schema.ts`
  - use `bun run db:studio` to view local db state

### deployment guide

this section is the “deployment guide” for submission purposes.

- local dev deploy - `bun run dev`
- release build - `bun run build` (or `bun run build:prod`)
- distribute - share the Electrobun build artifacts for the target OS

### additional helpful information

- formatting - `bun run format`
