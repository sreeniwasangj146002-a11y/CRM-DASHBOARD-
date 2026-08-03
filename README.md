# Greentiq CRM Dashboard

Advanced customer management dashboard built for the Front-End Developer take-home task.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui-style components** — hand-built on Radix UI primitives (Dialog, DropdownMenu,
  Select, Checkbox, Popover, Label) since the `shadcn` CLI needs network access to
  ui.shadcn.com, which wasn't available in the build sandbox. Same source-ownership model:
  the components live in `components/ui` and are yours to edit.
- **MongoDB** — real persistence via the official `mongodb` driver, connecting to a local
  MongoDB server. No more in-memory mock array; data survives restarts.
- **TanStack Query (React Query)** for all data fetching/caching/mutations
- **dnd-kit** for drag-and-drop reordering of saved filters
- **react-hook-form + zod** for form validation
- **zustand** (with `persist`) for saved filters state
- **sonner** for toast notifications

## Getting Started

### 1. Start a local MongoDB server

You need a MongoDB server running locally. If you don't already have one:

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Or run it in Docker
docker run -d --name greentiq-mongo -p 27017:27017 mongo:7
```

By default the app connects to `mongodb://127.0.0.1:27017` and uses the database
`greentiq_crm`. To point at a different host/db, copy `.env.local.example` to `.env.local`
and adjust `MONGODB_URI` / `MONGODB_DB`.

### 2. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first request to the API automatically creates indexes and,
if the `customers` collection is empty, seeds it with 150 realistic sample customers
(`lib/seed-data.ts`) so the app isn't empty on first run. After that, all reads and writes go
straight to MongoDB — nothing is held in a static in-memory array.

```bash
npm run build && npm run start   # production build
npm run lint                     # eslint
```

You can check the live database connection status any time from **Settings** in the app, or
by hitting `GET /api/health`.

## Feature Coverage

**Navigation & Dashboard**
- Persistent sidebar (`components/layout/sidebar.tsx`) with Dashboard, Contacts, Deals,
  Tasks, and Settings — collapses into a slide-over drawer on mobile.
- Top bar (`components/layout/topbar.tsx`) with a global search box (submits to
  `/contacts?q=...`), notification icon, and theme toggle.
- `/` is a Dashboard overview: live stat cards, a "Recently Contacted" feed, and quick links
  — all driven by real API data, no placeholders.

**Deals Pipeline (`/deals`)** — full CRUD, backed by a `deals` MongoDB collection
- Kanban board with six stages (Lead → Qualified → Proposal → Negotiation → Won / Lost),
  each column showing its own deal count and total value.
- **Real drag-and-drop** via `@dnd-kit/core` (`useDraggable`/`useDroppable`) — dragging a
  card to a different column PATCHes its stage in MongoDB immediately, with a toast if the
  update fails (and the board resyncs to the server's actual state).
- Add/Edit dialog: title, linked customer (pulled live from the customers collection),
  value, stage, owner, expected close date, notes — validated with zod, disabled submit +
  "Saving..." state, success/error toasts.
- Delete with confirmation dialog.
- Header stats (open deals, open pipeline value, won value, total deals) computed
  server-side via a MongoDB aggregation (`/api/deals/stats`).

**Tasks (`/tasks`)** — full CRUD, backed by a `tasks` MongoDB collection
- List view with status tabs (All / To Do / In Progress / Done) and live counts, plus
  real-time debounced search across title/description/related customer.
- Checkbox toggles a task done/not-done instantly (optimistic-feeling, backed by a real
  PATCH); overdue tasks are flagged in red.
- Add/Edit dialog: title, description, due date, priority, status, and an optional linked
  customer — zod-validated with inline errors and toasts.
- Delete with confirmation dialog.

**1. Customer List View (`/contacts`)**
- Table layout (`components/customers/customer-table.tsx`), responsive — columns collapse
  gracefully down to a single-column card feel on mobile.
- Real-time, debounced (300ms) search by name/email/company.
- Column sorting (name, email, last contact) with direction toggle.
- Pagination with selectable page size (10/25/50).

**2. Advanced Filters Panel** (`components/filters/filters-panel.tsx`)
- Slide-over sheet with status checkboxes, multi-select company filter (populated live from
  `/api/customers/companies`, i.e. whatever companies actually exist in the database), last-
  contact date range, phone partial-match, and email partial-match.
- "Save Custom Filter" persists a named filter combination via zustand + localStorage.
- Three pre-built templates ship by default: Active Customers, Recent Contacts, Inactive Leads.
- Saved filters are **drag-and-drop reorderable** using dnd-kit
  (`components/filters/sortable-saved-filter.tsx`).
- Clear All / Apply Filters, active-filter count badge on the trigger button, and filters
  compose cleanly with search (both are sent together to the API).

**3. Customer Details & Management**
- Click a row to open a details dialog; Edit and Delete are available there and from the
  row's overflow menu.
- Add/Edit form uses shadcn-style `Form`-equivalent primitives with zod validation (name,
  email format, phone format, required fields) and inline error messages.
- Delete requires confirmation in a dedicated dialog.
- Dashboard's "Add Customer" button deep-links to `/contacts?new=1`, which opens the form
  automatically.

**4. Data fetching with TanStack Query**
- All reads/writes go through `hooks/use-customers.ts` and
  `hooks/use-customer-mutations.ts`. `staleTime` + `placeholderData: keepPreviousData` for
  caching without layout flicker; mutations invalidate the `customers` query key on
  success and show a toast on both success and failure.

**5. Form validation & feedback**
- zod schema in `lib/validation.ts`; disabled submit buttons + "Saving..." state while a
  mutation is in flight; success/error toasts via `sonner` for every create/update/delete.
- API routes also validate server-side (required fields, duplicate email checks) and return
  proper HTTP status codes (400/404/409/503) with human-readable messages.

**6. Drag & Drop**
- Implemented via dnd-kit (`@dnd-kit/core` + `@dnd-kit/sortable`) for reordering the saved
  filters list in the filters panel — a real sortable list, not HTML5 native drag.

**Bonus features implemented**
- CSV export of the current filtered/sorted page
- Dark/light theme toggle (persisted to localStorage), also switchable from Settings
- Cmd/Ctrl+K opens the filters panel from anywhere on `/contacts`
- Debounced search
- Live MongoDB connection health check, visible in Settings

**Not implemented** (flagged rather than faked): bulk row selection/bulk actions on the
customer list. Everything else in the brief's "Nice-to-Have" list is covered above, and the
Deals/Tasks sidebar sections (shown as icons in the mockup) are fully working modules with
their own MongoDB collections rather than static placeholders.

## Architecture Notes

```
app/
  api/customers/          REST endpoints (list/create, get/update/delete, stats, companies)
  api/deals/                REST endpoints (list/create, get/update/delete, stats)
  api/tasks/                 REST endpoints (list/create, get/update/delete)
  api/health/              MongoDB connection health check
  page.tsx                 Dashboard overview
  contacts/page.tsx        full customer management (search, filters, table, CRUD)
  deals/page.tsx            Kanban pipeline board (drag-and-drop stage changes, full CRUD)
  tasks/page.tsx             task list (status tabs, search, complete-toggle, full CRUD)
  settings/page.tsx        theme + live DB connection status
components/
  ui/                      shadcn-style primitives (Button, Dialog, Sheet, Select, ...)
  layout/                  Sidebar, Topbar, AppShell
  customers/                table, pagination, search, form dialog, details dialog, delete dialog
  filters/                  filters panel + sortable saved-filter chip
  deals/                     Kanban column/card, form dialog, delete dialog
  tasks/                      task row, form dialog, delete dialog
hooks/                      React Query hooks + zustand store + debounce
lib/
  mongodb.ts               connection singleton + one-time index creation/seeding
  seed-data.ts              deterministic generator used ONLY to seed an empty database
  serialize.ts              strips Mongo's _id before responses reach the client
  api-client.ts, validation.ts, csv-export.ts, utils.ts
types/                      shared TypeScript types
```

- The API lives behind the same `fetch`-based `lib/api-client.ts` interface a real backend
  would use — swapping MongoDB for another database only touches `lib/mongodb.ts` and the
  route handlers, never the client code.
- Filtering, sorting, and pagination all happen **server-side**, as real MongoDB queries
  (`find` + `sort` + `skip`/`limit` + `countDocuments`) — the client never has the full
  dataset in memory.
- No `next/font/google` — the type stack uses system fonts so the project builds fully
  offline (useful in network-restricted CI as well).

## Assumptions

- "Database" is a local MongoDB server (per the task requirements); the app auto-creates
  indexes and seeds sample data into an empty database on first run so it's usable
  immediately, but nothing about the running app depends on that seed data specifically —
  delete everything through the UI and it stays empty.
- Status is modeled as a two-value enum (`active`/`inactive`) per the brief's table columns;
  the filter-panel mockup shows extra statuses (Prospect, Lead, Archive) but the written
  spec only requires Active/Inactive, so I matched the written spec.
- Deals and Tasks are real modules with their own MongoDB collections, full CRUD, and (for
  Deals) drag-and-drop stage changes — going beyond the written spec's required scope to
  match the mockup's sidebar navigation with working functionality instead of dead links.
