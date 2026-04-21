import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "VolunCare — Tu pulso emocional" },
      { name: "description", content: "Cuida a quienes cuidan. Check-in diario para voluntarios." },
    ],
  }),
  component: Dashboard,
});

type Profile = { nombre_completo: string };
type LastCheckIn = {
  nivel_energia: number;
  nivel_animo: number;
  emocion_principal: string;
  fecha_hora: string;
};

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

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<LastCheckIn | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("nombre_completo")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch last check-in
      const { data: checkIns } = await supabase
        .from("check_ins")
        .select("nivel_energia, nivel_animo, emocion_principal, fecha_hora")
        .eq("voluntario_id", user.id)
        .order("fecha_hora", { ascending: false })
        .limit(30);

      if (checkIns && checkIns.length > 0) {
        setLastCheckIn(checkIns[0]);

        // Calculate streak: consecutive days with at least one check-in
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() - i);
          const dateStr = targetDate.toISOString().slice(0, 10);

          const hasCheckIn = checkIns.some((c) => c.fecha_hora.slice(0, 10) === dateStr);

          if (hasCheckIn) {
            currentStreak++;
          } else {
            break;
          }
        }
        setStreak(currentStreak);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const firstName = profile?.nombre_completo?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Voluntario";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppShell title="VolunCare">
      <section className="space-y-5">
        {/* Greeting card */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5">
          <p className="text-sm text-muted-foreground">{timeGreeting()},</p>
          <h2 className="mt-1 text-xl font-semibold">
            {loading ? "..." : firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Gracias por tu impacto hoy.</p>
        </div>

        {/* Main CTA */}
        <Link
          to="/check-in"
          id="main-checkin-btn"
          className="flex h-32 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <span className="text-2xl">💙</span>
          Registrar mi pulso de hoy
        </Link>

        {/* Streak card */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{streak > 0 ? "🔥" : "💤"}</span>
            <p className="text-sm font-medium">Racha</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {loading
              ? "Cargando..."
              : streak === 0
                ? "¡Haz tu primer check-in para comenzar tu racha!"
                : streak === 1
                  ? "Llevas 1 día cuidando de ti. ¡Sigue así!"
                  : `Llevas ${streak} días seguidos haciendo tu check-in. ¡Increíble! 🎉`}
          </p>
        </div>

        {/* Last check-in card */}
        {lastCheckIn && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-medium">📊 Último registro</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(lastCheckIn.fecha_hora)}</span>
            </div>
            <div className="flex gap-3 mt-1">
              <div className="flex-1 rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Energía</p>
                <p className="text-lg font-semibold">{lastCheckIn.nivel_energia}/5</p>
              </div>
              <div className="flex-1 rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Ánimo</p>
                <p className="text-lg font-semibold">{lastCheckIn.nivel_animo}/5</p>
              </div>
              <div className="flex-1 rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Emoción</p>
                <p className="text-lg">
                  {EMOCION_EMOJIS[lastCheckIn.emocion_principal] ?? "❓"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/historial"
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition hover:bg-muted/50"
          >
            <span className="text-2xl">📈</span>
            <span className="text-xs font-medium">Mi historial</span>
          </Link>
          <Link
            to="/botiquin"
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition hover:bg-muted/50"
          >
            <span className="text-2xl">🩹</span>
            <span className="text-xs font-medium">Botiquín</span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
