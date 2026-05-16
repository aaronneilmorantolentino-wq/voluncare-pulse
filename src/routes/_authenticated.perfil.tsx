import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil — VolunCare" }] }),
  component: Perfil,
});

const profileSchema = z.object({
  nombre_completo: z.string(),
  email: z.string(),
  rol_asignado: z.string().nullable(),
  created_at: z.string(),
});

type Profile = z.infer<typeof profileSchema>;

const statsRowSchema = z.object({
  nivel_energia: z.number(),
  nivel_animo: z.number(),
  bandera_riesgo: z.boolean().nullable(),
});

type Stats = {
  totalCheckIns: number;
  riskDays: number;
  avgAnimo: number;
  avgEnergia: number;
};

const ROL_LABELS: Record<string, string> = {
  campo: "🌿 Trabajo de campo",
  soporte_telefonico: "📞 Soporte telefónico",
  logistica: "📦 Logística",
};

function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("nombre_completo, email, rol_asignado, created_at")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return profileSchema.parse(data);
    },
    enabled: !!user,
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["profile_stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("nivel_energia, nivel_animo, bandera_riesgo")
        .eq("voluntario_id", user!.id)
        .limit(365);
      if (error) throw error;
      if (!data || data.length === 0) return null;

      const parsed = z.array(statsRowSchema).parse(data);

      return {
        totalCheckIns: parsed.length,
        riskDays: parsed.filter((c) => c.bandera_riesgo).length,
        avgAnimo: +(parsed.reduce((s, c) => s + c.nivel_animo, 0) / parsed.length).toFixed(1),
        avgEnergia: +(parsed.reduce((s, c) => s + c.nivel_energia, 0) / parsed.length).toFixed(1),
      } as Stats;
    },
    enabled: !!user,
  });

  const loading = isProfileLoading || isStatsLoading;
  const isError = isProfileError || isStatsError;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <AppShell title="Mi perfil">
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
            <p className="text-3xl">⚠️</p>
            <p className="mt-2 font-medium">Error de conexión</p>
            <p className="mt-1 text-sm opacity-80">
              No pudimos cargar tus datos. Por favor, verifica tu conexión e intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-destructive/20 px-4 py-2 text-sm font-medium transition hover:bg-destructive/30"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {(profile?.nombre_completo?.[0] ?? user?.email?.[0] ?? "V").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {profile?.nombre_completo ?? "Voluntario"}
                  </h2>
                  <p className="text-xs text-muted-foreground break-all">
                    {profile?.email ?? user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.rol_asignado && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {ROL_LABELS[profile.rol_asignado] ?? profile.rol_asignado}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  🗓️ Miembro desde {memberSince}
                </span>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
                  <p className="text-xs text-muted-foreground">Check-ins totales</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-2xl font-bold">{stats.avgAnimo}</p>
                  <p className="text-xs text-muted-foreground">Ánimo promedio</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-2xl font-bold">{stats.avgEnergia}</p>
                  <p className="text-xs text-muted-foreground">Energía promedio</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className={`text-2xl font-bold ${stats.riskDays > 0 ? "text-amber-500" : ""}`}>
                    {stats.riskDays}
                  </p>
                  <p className="text-xs text-muted-foreground">Alertas de riesgo</p>
                </div>
              </div>
            )}

            {/* Privacy note */}
            <div className="rounded-2xl bg-muted/30 p-4 space-y-1">
              <p className="text-xs font-medium">🔒 Privacidad y ética</p>
              <p className="text-xs text-muted-foreground">
                Tus registros emocionales son privados. Solo tú y tu coordinador autorizado pueden
                verlos. Los datos se usan exclusivamente para tu bienestar, nunca para evaluaciones
                de desempeño.
              </p>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full rounded-xl border border-border bg-background py-3 text-sm font-medium transition hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
