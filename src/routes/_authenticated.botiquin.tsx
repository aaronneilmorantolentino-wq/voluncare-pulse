import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/botiquin")({
  head: () => ({ meta: [{ title: "Botiquín — VolunCare" }] }),
  component: Botiquin,
});

type Exercise = {
  id: string;
  emoji: string;
  title: string;
  duration: string;
  description: string;
  steps: string[];
};

const EXERCISES: Exercise[] = [
  {
    id: "grounding",
    emoji: "🌍",
    title: "Grounding 5-4-3-2-1",
    duration: "3 min",
    description:
      "Técnica de anclaje sensorial para reducir la ansiedad y reconectarte con el momento presente.",
    steps: [
      "Identifica 5 cosas que puedas VER a tu alrededor",
      "Identifica 4 cosas que puedas TOCAR (siente su textura)",
      "Identifica 3 cosas que puedas ESCUCHAR",
      "Identifica 2 cosas que puedas OLER",
      "Identifica 1 cosa que puedas SABOREAR",
    ],
  },
  {
    id: "respiracion",
    emoji: "🫁",
    title: "Respiración Diafragmática",
    duration: "2 min",
    description:
      "Activa tu sistema nervioso parasimpático para reducir el estrés fisiológico de forma rápida.",
    steps: [
      "Siéntate cómodamente o acuéstate. Coloca una mano en el pecho y otra en el abdomen",
      "Inhala lentamente por la nariz durante 4 segundos (siente cómo sube tu abdomen)",
      "Sostén la respiración 2 segundos",
      "Exhala lentamente por la boca durante 6 segundos",
      "Repite 5 ciclos completos",
    ],
  },
  {
    id: "bodyscan",
    emoji: "🧘",
    title: "Body Scan Express",
    duration: "4 min",
    description:
      "Escaneo corporal breve para identificar dónde estás acumulando tensión y liberarla conscientemente.",
    steps: [
      "Cierra los ojos. Lleva la atención a tu cabeza y frente. ¿Hay tensión? Suéltala",
      "Baja a tu mandíbula y hombros. Relaja conscientemente",
      "Siente tu pecho y abdomen. Observa tu respiración sin cambiarla",
      "Nota tus manos, ¿están apretadas? Ábrelas suavemente",
      "Siente tus piernas y pies. Imagina que la tensión sale por las plantas de tus pies",
    ],
  },
  {
    id: "restructuracion",
    emoji: "🧠",
    title: "Reestructuración Cognitiva Rápida",
    duration: "5 min",
    description:
      "Técnica TCC para identificar y cuestionar pensamientos automáticos negativos.",
    steps: [
      "Escribe el pensamiento que te genera malestar (ej: 'No estoy haciendo suficiente')",
      "Pregúntate: ¿Qué evidencia tengo a favor y en contra de este pensamiento?",
      "¿Hay una forma alternativa y más equilibrada de ver la situación?",
      "¿Le diría esto a un compañero voluntario en mi misma situación?",
      "Reformula: 'Estoy haciendo lo mejor que puedo con los recursos que tengo'",
    ],
  },
];

const CRISIS_CONTACTS = [
  {
    name: "Línea de la Vida (México)",
    phone: "800 911 2000",
    description: "Atención 24/7, gratuita y confidencial",
  },
  {
    name: "SAPTEL",
    phone: "55 5259 8121",
    description: "Servicio de Atención Psicológica Telefónica",
  },
];

function Botiquin() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell title="Botiquín de Apoyo">
      <div className="space-y-5">
        {/* Emergency contact */}
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🆘</span>
            <h3 className="font-semibold text-destructive">Contacto de Crisis</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Si tú o alguien que conoces está en crisis, no dudes en pedir ayuda profesional.
          </p>
          {CRISIS_CONTACTS.map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-background p-3 transition hover:bg-destructive/5"
            >
              <span className="text-lg">📞</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
              <span className="text-sm font-semibold text-destructive">{c.phone}</span>
            </a>
          ))}
        </div>

        {/* Coordinator contact */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <h3 className="text-sm font-semibold text-amber-900">Tu coordinador/a</h3>
          </div>
          <p className="text-xs text-amber-800">
            Si sientes que necesitas hablar con alguien de confianza dentro de tu organización, acércate a tu
            coordinador/a de voluntariado. Tu bienestar es prioridad.
          </p>
        </div>

        {/* Quick exercises */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold px-1">🧰 Ejercicios rápidos</h3>
          <p className="text-xs text-muted-foreground px-1 mb-3">
            Técnicas basadas en evidencia psicológica para momentos difíciles.
          </p>
        </div>

        {EXERCISES.map((ex) => (
          <div
            key={ex.id}
            className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
              className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/50"
            >
              <span className="text-2xl">{ex.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{ex.title}</p>
                <p className="text-xs text-muted-foreground">{ex.duration}</p>
              </div>
              <span
                className={`text-muted-foreground transition-transform ${expanded === ex.id ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {expanded === ex.id && (
              <div className="border-t border-border px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-muted-foreground">{ex.description}</p>
                <ol className="space-y-2">
                  {ex.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}

        {/* Reassurance */}
        <div className="rounded-2xl bg-muted/30 p-4 text-center space-y-1">
          <p className="text-sm">💙</p>
          <p className="text-xs text-muted-foreground">
            Recuerda: pedir ayuda no es un signo de debilidad, es un acto de valentía. Tu bienestar importa
            tanto como el de las personas a quienes ayudas.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
