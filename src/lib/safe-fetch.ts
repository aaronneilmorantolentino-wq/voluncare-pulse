/**
 * Resilient wrapper for Supabase queries with retry logic.
 * Retries up to 2 times with exponential backoff on network failures.
 */
export async function safeFetch<T>(
  queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>,
  retries = 2,
): Promise<{ data: T | null; error: string | null }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await queryFn();
      if (result.error) {
        return { data: null, error: result.error.message };
      }
      return { data: result.data, error: null };
    } catch (err) {
      // Network error (Failed to fetch, timeout, etc.)
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1500ms
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return {
        data: null,
        error: "Sin conexión. Verifica tu internet e intenta de nuevo.",
      };
    }
  }
  return { data: null, error: "Error inesperado." };
}
