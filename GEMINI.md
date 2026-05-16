# Project: VolunCare Pulse 🏥

## Technical Stack
- **Framework**: React 19 (Vite v7)
- **Routing**: TanStack Router (file-based, `src/routes/`)
- **State Management**: TanStack Query (`useQuery`, `useInfiniteQuery`, `useMutation`)
- **Styling**: Tailwind CSS v4 (vanilla CSS utilities, NO shadcn/ui)
- **Backend/Auth**: Supabase (Auth + PostgreSQL)
- **Validation**: Zod (input AND output schemas)
- **Charts**: Recharts
- **Deployment**: Vercel (auto-deploy from GitHub `main`)
- **Runtime**: Node.js

## Key Commands
- `npm run dev`: Start development server (Vite)
- `npm run build`: Production build
- `npx tsc --noEmit`: Type-check without emitting

## Architecture (Post-Hardening v2)

### Data Layer
- **Reads**: ALL data fetching uses `useQuery` or `useInfiniteQuery`. NEVER `useEffect` + manual fetch.
- **Writes**: ALL mutations use `useMutation` with `onSuccess: invalidateQueries()`.
- **Validation**: Zod schemas for BOTH directions:
  - Input (Supabase → Frontend): `zodSchema.parse(data)` — never `as Type`.
  - Output (Frontend → Supabase): `zodSchema.safeParse(payload)` before insert.

### Error Handling
- Every query route renders `isError` state with user-facing retry UI.
- No silent failures. "Error de conexión" message + retry button.

### Performance
- Heavy computations (`chartData`, `sortedEmociones`, `riskDays`) wrapped in `useMemo`.
- No raw loops in render path.

### Components
- Only 3 UI components remain: `slider.tsx`, `textarea.tsx`, `progress.tsx`.
- Layout: `AppShell.tsx` (bottom nav + header).
- Do NOT recreate deleted shadcn/ui components.

## Supabase
- Client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/types.ts`
- Tables: `profiles`, `check_ins`, `recursos`

## Safety Guardrails
- NEVER re-add deleted shadcn/ui components (purged in hardening audit).
- NEVER use `useEffect` for data fetching. Use React Query.
- NEVER use `as Type` casting for Supabase responses. Use `zodSchema.parse()`.
- ALWAYS invalidate related caches (`check_ins`, `profile_stats`) after mutations.
- ALWAYS run `npx tsc --noEmit` before considering a task complete.

## Antigravity Policies
- **Terminal Policy**: Auto (propose and wait for approval).
- **Planning Mode**: Mandatory for architectural changes (new routes, DB schema changes).
- **Verification**: Always run type-check + build after code modifications.
