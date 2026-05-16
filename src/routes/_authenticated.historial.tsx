import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/historial")({
  head: () => ({ meta: [{ title: "Historial — VolunCare" }] }),
  component: Historial,
});

const checkInRowSchema = z.object({
  id: z.string(),
  nivel_energia: z.number(),
  nivel_animo: z.number(),
  emocion_principal: z.string(),
  fecha_hora: z.string(),
  bandera_riesgo: z.boolean().nullable(),
});

type CheckInRow = z.infer<typeof checkInRowSchema>;

const EMOCION_EMOJIS: Record<string, string> = {
  alegria: "😊",
  confianza: "🤝",
  miedo: "😰",
  sorpresa: "😲",
  tristeza: "😢",
  disgusto: "😣",
  enojo: "😠",
  anticipacion: "🤔",
};

const PAGE_SIZE = 20;

function Historial() {
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isLoading, isError, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["check_ins", user?.id],
      queryFn: async ({ pageParam = 0 }) => {
        const { data, error } = await supabase
          .from("check_ins")
          .select("id, nivel_energia, nivel_animo, emocion_principal, fecha_hora, bandera_riesgo")
          .eq("voluntario_id", user!.id)
          .order("fecha_hora", { ascending: false })
          .range(pageParam, pageParam + PAGE_SIZE - 1);
        if (error) throw error;
        return z.array(checkInRowSchema).parse(data);
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined;
      },
      enabled: !!user,
    });

  const checkIns: CheckInRow[] = useMemo(() => {
    return (data?.pages.flat() as CheckInRow[]) || [];
  }, [data]);

  const chartData = useMemo(() => {
    return [...checkIns].reverse().map((c: CheckInRow) => ({
      fecha: new Date(c.fecha_hora).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      }),
      Energía: c.nivel_energia,
      Ánimo: c.nivel_animo,
    }));
  }, [checkIns]);

  const sortedEmociones = useMemo(() => {
    const emocionCounts = checkIns.reduce(
      (acc: Record<string, number>, c: CheckInRow) => {
        acc[c.emocion_principal] = (acc[c.emocion_principal] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(emocionCounts).sort((a, b) => b[1] - a[1]);
  }, [checkIns]);

  const riskDays = useMemo(() => {
    return checkIns.filter((c: CheckInRow) => c.bandera_riesgo).length;
  }, [checkIns]);

  return (
    <AppShell title="Mi historial">
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
            <p className="text-3xl">⚠️</p>
            <p className="mt-2 font-medium">Error de conexión</p>
            <p className="mt-1 text-sm opacity-80">
              No pudimos cargar tu historial. Por favor, verifica tu conexión e intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-destructive/20 px-4 py-2 text-sm font-medium transition hover:bg-destructive/30"
            >
              Reintentar
            </button>
          </div>
        ) : checkIns.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-2 font-medium">Aún no tienes registros</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Haz tu primer check-in para comenzar a ver tu historial emocional.
            </p>
          </div>
        ) : (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold">{checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Registros</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold">
                  {checkIns.length > 0
                    ? (checkIns.reduce((s: number, c: CheckInRow) => s + c.nivel_animo, 0) / checkIns.length).toFixed(1)
                    : "0.0"}
                </p>
                <p className="text-xs text-muted-foreground">Ánimo prom.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className={`text-2xl font-bold ${riskDays > 0 ? "text-amber-500" : ""}`}>
                  {riskDays}
                </p>
                <p className="text-xs text-muted-foreground">Días riesgo</p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">📈 Tendencia emocional</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="Energía"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Ánimo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top emotions */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">🎭 Emociones más frecuentes</h3>
              <div className="space-y-2">
                {sortedEmociones.slice(0, 4).map(([emocion, count]) => (
                  <div key={emocion} className="flex items-center gap-3">
                    <span className="text-xl">{EMOCION_EMOJIS[emocion] ?? "❓"}</span>
                    <span className="flex-1 text-sm capitalize">{emocion}</span>
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(count / checkIns.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent entries */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">🕐 Registros recientes</h3>
              <div className="space-y-2">
                {checkIns.slice(0, 10).map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 rounded-lg p-2 text-sm ${c.bandera_riesgo ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : "bg-muted/30"}`}
                  >
                    <span className="text-lg">{EMOCION_EMOJIS[c.emocion_principal]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.fecha_hora).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-xs">⚡{c.nivel_energia}</span>
                    <span className="text-xs">💙{c.nivel_animo}</span>
                    {c.bandera_riesgo && <span className="text-xs">⚠️</span>}
                  </div>
                ))}
              </div>
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="mt-3 w-full rounded-lg border border-border bg-background py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Cargando..." : "Ver más registros"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
