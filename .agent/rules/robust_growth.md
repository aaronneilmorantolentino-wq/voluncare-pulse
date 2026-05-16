# Rule: Robust Growth 🛡️

## Goal
Balance fast innovation with a solid foundation that prevents future technical debt.

## Constraints (MUST follow)
- NEVER ship code without `tsc --noEmit` passing.
- NEVER use `any`. Use `unknown` with type guards.
- ALL Supabase responses MUST be parsed with Zod schemas. No `as Type` casting.
- ALL `useMutation` calls MUST include `onSuccess` with `invalidateQueries` for related data.
- Error states (`isError`) MUST render user-facing recovery UI with retry button, not silent failures.
- NEVER use `useEffect` for data fetching. Use `useQuery` or `useInfiniteQuery`.

## Preferences (SHOULD follow)
- Prefer `useMemo` for derived state over recomputation in render path.
- Keep components under 200 lines. Extract logic to custom hooks when exceeded.
- Document non-obvious decisions in code comments.
- New data entry points must have both input AND output Zod validation.
- Modular design: keep new features decoupled so they can be iterated on or replaced.
