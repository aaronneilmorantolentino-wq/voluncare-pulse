# Skill: Hardening Audit 🔬

## When to Use
When the user asks to "audit", "harden", "verify", or "check quality" of the codebase.

## Procedure
1. Run `npx tsc --noEmit` — report any type errors.
2. Run `npm run build` — report any warnings or failures.
3. Search for `useEffect` patterns combined with `fetch`, `supabase`, or async calls (anti-pattern).
4. Search for `as Type` casting on Supabase/API responses (anti-pattern, should use Zod).
5. Verify all `useMutation` calls include `invalidateQueries` in `onSuccess`.
6. Verify all query routes have `isError` handling with user-facing UI.
7. Check for missing `useMemo` on heavy computations (reduce, filter, map on arrays).
8. Generate a structured report:
   - Type Safety: PASS/FAIL
   - Build: PASS/FAIL
   - Data Fetching Pattern: PASS/FAIL
   - Zod Validation: PASS/FAIL
   - Cache Invalidation: PASS/FAIL
   - Error Handling: PASS/FAIL
   - Performance: PASS/FAIL
