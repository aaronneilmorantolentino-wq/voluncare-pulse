# VolunCare Pulse — Agent Instructions

## Stack
React 19 + TanStack Router + TanStack Query + Supabase + Zod + Vite + Recharts

## Build & Test
- Dev: `npm run dev`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`

## Project Structure
```
src/
├── components/
│   ├── layout/AppShell.tsx    # Bottom nav + header wrapper
│   └── ui/                    # Only slider, textarea, progress
├── contexts/AuthContext.tsx    # Supabase auth provider
├── integrations/supabase/     # Client + auto-generated types
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx             # Root layout + 404 page
│   ├── auth.tsx               # Login/register
│   ├── _authenticated.tsx     # Auth guard layout
│   ├── _authenticated.index.tsx       # Dashboard
│   ├── _authenticated.check-in.tsx    # 3-step wizard (useMutation)
│   ├── _authenticated.historial.tsx   # Analytics (useInfiniteQuery + useMemo)
│   ├── _authenticated.perfil.tsx      # Profile (useQuery + Zod)
│   ├── _authenticated.recursos.tsx    # Resources library
│   └── _authenticated.botiquin.tsx    # Crisis toolkit
└── styles.css                 # Tailwind v4 entry
```

## Conventions
- TypeScript strict mode. No `any`.
- All data fetching via TanStack Query (useQuery/useMutation).
- All external data validated with Zod schemas (parse, not cast).
- Conventional Commits for git messages.
- Spanish language for UI strings.

## Do NOT
- Add new shadcn/ui components (project was intentionally purged).
- Use useEffect for async data fetching.
- Use type casting (`as Type`) for API responses.
- Re-add any of the 44 deleted UI components.
