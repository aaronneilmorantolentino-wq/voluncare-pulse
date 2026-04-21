import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/recursos")({
  head: () => ({ meta: [{ title: "Recursos — VolunCare" }] }),
  component: Recursos,
});

type Recurso = {
  id: string;
  nombre_recurso: string;
  tipo_intervencion: string;
  url_contenido: string;
  umbral_recomendado: number | null;
};

const TIPO_EMOJIS: Record<string, string> = {
  mindfulness: "🧘",
  tcc: "🧠",
  linea_crisis: "📞",
  reestructuracion_cognitiva: "💭",
};

const TIPO_LABELS: Record<string, string> = {
  mindfulness: "Mindfulness",
  tcc: "TCC",
  linea_crisis: "Línea de Crisis",
  reestructuracion_cognitiva: "Reestructuración Cognitiva",
};

const TIPO_COLORS: Record<string, string> = {
  mindfulness: "bg-emerald-100 text-emerald-800 border-emerald-300",
  tcc: "bg-blue-100 text-blue-800 border-blue-300",
  linea_crisis: "bg-red-100 text-red-800 border-red-300",
  reestructuracion_cognitiva: "bg-purple-100 text-purple-800 border-purple-300",
};

// Fallback resources in case the DB table is empty
const FALLBACK_RECURSOS: Recurso[] = [
  {
    id: "f1",
    nombre_recurso: "Meditación guiada: Compasión por ti mismo",
    tipo_intervencion: "mindfulness",
    url_contenido: "https://www.youtube.com/watch?v=sG7DBA-mgFY",
    umbral_recomendado: 3,
  },
  {
    id: "f2",
    nombre_recurso: "Ejercicio: Diario de gratitud para voluntarios",
    tipo_intervencion: "tcc",
    url_contenido: "https://positivepsychology.com/gratitude-journal/",
    umbral_recomendado: 4,
  },
  {
    id: "f3",
    nombre_recurso: "Guía: Identificar distorsiones cognitivas",
    tipo_intervencion: "reestructuracion_cognitiva",
    url_contenido: "https://www.therapistaid.com/therapy-worksheet/cognitive-distortions",
    umbral_recomendado: 2,
  },
  {
    id: "f4",
    nombre_recurso: "Línea de la Vida — Apoyo emocional 24/7",
    tipo_intervencion: "linea_crisis",
    url_contenido: "tel:8009112000",
    umbral_recomendado: 1,
  },
  {
    id: "f5",
    nombre_recurso: "Respiración 4-7-8 para dormir mejor",
    tipo_intervencion: "mindfulness",
    url_contenido: "https://www.youtube.com/watch?v=YRPh_GaiL8s",
    umbral_recomendado: 3,
  },
  {
    id: "f6",
    nombre_recurso: "TCC: Registro de pensamientos automáticos",
    tipo_intervencion: "tcc",
    url_contenido: "https://www.therapistaid.com/therapy-worksheet/cbt-thought-record",
    umbral_recomendado: 2,
  },
];

function Recursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("recursos_apoyo")
      .select("id, nombre_recurso, tipo_intervencion, url_contenido, umbral_recomendado")
      .order("tipo_intervencion")
      .then(({ data }) => {
        setRecursos(data && data.length > 0 ? data : FALLBACK_RECURSOS);
        setLoading(false);
      });
  }, []);

  const filtered = filter ? recursos.filter((r) => r.tipo_intervencion === filter) : recursos;

  const tipos = [...new Set(recursos.map((r) => r.tipo_intervencion))];

  return (
    <AppShell title="Biblioteca">
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Recursos psicoeducativos seleccionados para tu bienestar emocional.
        </p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            Todos ({recursos.length})
          </button>
          {tipos.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(filter === t ? null : t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {TIPO_EMOJIS[t]} {TIPO_LABELS[t] ?? t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <a
                key={r.id}
                href={r.url_contenido}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:bg-muted/50 hover:shadow-sm"
              >
                <span className="text-2xl mt-0.5">
                  {TIPO_EMOJIS[r.tipo_intervencion] ?? "📄"}
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium leading-snug">{r.nombre_recurso}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${TIPO_COLORS[r.tipo_intervencion] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}
                    >
                      {TIPO_LABELS[r.tipo_intervencion] ?? r.tipo_intervencion}
                    </span>
                    {r.umbral_recomendado && (
                      <span className="text-[10px] text-muted-foreground">
                        Recomendado si ánimo ≤ {r.umbral_recomendado}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
