import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type EmocionPluchtik = Database["public"]["Enums"]["emocion_plutchik"];

export const Route = createFileRoute("/_authenticated/check-in")({
  head: () => ({ meta: [{ title: "Check-In — VolunCare" }] }),
  component: CheckIn,
});

const EMOCIONES: { value: EmocionPluchtik; emoji: string; label: string; color: string }[] = [
  { value: "alegria", emoji: "😊", label: "Alegría", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
  { value: "confianza", emoji: "🤝", label: "Confianza", color: "bg-green-100 border-green-400 text-green-800" },
  { value: "miedo", emoji: "😰", label: "Miedo", color: "bg-purple-100 border-purple-400 text-purple-800" },
  { value: "sorpresa", emoji: "😲", label: "Sorpresa", color: "bg-cyan-100 border-cyan-400 text-cyan-800" },
  { value: "tristeza", emoji: "😢", label: "Tristeza", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { value: "disgusto", emoji: "😣", label: "Disgusto", color: "bg-lime-100 border-lime-400 text-lime-800" },
  { value: "enojo", emoji: "😠", label: "Enojo", color: "bg-red-100 border-red-400 text-red-800" },
  { value: "anticipacion", emoji: "🤔", label: "Anticipación", color: "bg-orange-100 border-orange-400 text-orange-800" },
];

const ENERGIA_LABELS = ["🔋 Agotado", "😔 Bajo", "😐 Normal", "💪 Bien", "⚡ Lleno"];
const ANIMO_LABELS = ["🌧️ Muy bajo", "🌥️ Bajo", "⛅ Neutral", "🌤️ Bien", "☀️ Excelente"];

const MENSAJES_EMPATICOS = [
  "Tu bienestar importa. Gracias por dedicarte este momento. 💙",
  "Reconocer cómo te sientes es un acto de valentía. ¡Bien hecho! ✨",
  "Cada check-in te acerca a conocerte mejor. Gracias por cuidarte. 🌱",
  "Tu labor transforma vidas. Ahora cuida de la tuya también. 🤗",
  "Has dado un paso importante. Tu autoconocimiento crece cada día. 🌟",
];

function CheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [energia, setEnergia] = useState(3);
  const [animo, setAnimo] = useState(3);
  const [emocion, setEmocion] = useState<EmocionPluchtik | null>(null);
  const [catarsis, setCatarsis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdvance = step === 1 ? true : step === 2 ? emocion !== null : true;

  const handleSubmit = async () => {
    if (!user || !emocion) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.from("check_ins").insert({
      voluntario_id: user.id,
      nivel_energia: energia,
      nivel_animo: animo,
      emocion_principal: emocion,
      caja_catarsis: catarsis.trim() || null,
    });

    setSubmitting(false);

    if (err) {
      setError("No se pudo guardar tu registro. Intenta de nuevo.");
      return;
    }

    setDone(true);
  };

  if (done) {
    const msg = MENSAJES_EMPATICOS[Math.floor(Math.random() * MENSAJES_EMPATICOS.length)];
    return (
      <AppShell title="¡Listo!">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl animate-in zoom-in-50 duration-500">
            ✅
          </div>
          <h2 className="text-xl font-semibold text-center">Check-in guardado</h2>
          <p className="text-center text-sm text-muted-foreground max-w-xs">{msg}</p>

          {(energia + animo) < 4 && (
            <div className="w-full rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 space-y-2">
              <p className="font-semibold">💛 Notamos que fue un día difícil</p>
              <p>Recuerda que está bien no estar bien. Si necesitas apoyo inmediato, visita el <strong>Botiquín</strong>.</p>
              <button
                onClick={() => navigate({ to: "/botiquin" })}
                className="mt-2 w-full rounded-lg bg-amber-200 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-300"
              >
                Ir al Botiquín de Apoyo
              </button>
            </div>
          )}

          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Volver al inicio
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="¿Cómo estás?">
      <div className="space-y-5">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paso {step} de 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} />
        </div>

        {/* Step 1: Energy & Mood sliders */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <h3 className="font-semibold">⚡ Nivel de Energía</h3>
              <div className="space-y-3">
                <Slider
                  id="energia-slider"
                  min={1}
                  max={5}
                  step={1}
                  value={[energia]}
                  onValueChange={([v]) => setEnergia(v)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {ENERGIA_LABELS.map((l, i) => (
                    <span
                      key={i}
                      className={`transition-all ${energia === i + 1 ? "font-bold text-foreground scale-110" : ""}`}
                    >
                      {l.split(" ")[0]}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm font-medium">{ENERGIA_LABELS[energia - 1]}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <h3 className="font-semibold">💙 Nivel de Ánimo</h3>
              <div className="space-y-3">
                <Slider
                  id="animo-slider"
                  min={1}
                  max={5}
                  step={1}
                  value={[animo]}
                  onValueChange={([v]) => setAnimo(v)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {ANIMO_LABELS.map((l, i) => (
                    <span
                      key={i}
                      className={`transition-all ${animo === i + 1 ? "font-bold text-foreground scale-110" : ""}`}
                    >
                      {l.split(" ")[0]}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm font-medium">{ANIMO_LABELS[animo - 1]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Emotion selector (Plutchik) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold">🎨 Emoción Principal</h3>
              <p className="text-xs text-muted-foreground">
                Basada en la Rueda de Plutchik. ¿Cuál describe mejor tu estado ahora?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {EMOCIONES.map((e) => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setEmocion(e.value)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all active:scale-95 ${
                      emocion === e.value
                        ? `${e.color} border-current shadow-md scale-[1.02]`
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span className="text-xl">{e.emoji}</span>
                    <span>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Catharsis box */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold">📝 Caja de Catarsis</h3>
              <p className="text-xs text-muted-foreground">
                Opcional. Escribir lo que sientes ayuda a regular tus emociones. Este espacio es tuyo y es privado.
              </p>
              <Textarea
                id="catarsis-textarea"
                placeholder="¿Hay algo específico que te haya pesado hoy o algún logro que quieras compartir?"
                value={catarsis}
                onChange={(e) => setCatarsis(e.target.value)}
                rows={5}
                className="resize-none rounded-xl"
              />
              <p className="text-right text-xs text-muted-foreground">
                {catarsis.length} caracteres
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-medium transition hover:bg-muted"
            >
              ← Atrás
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep(step + 1)}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !emocion}
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Guardar Check-In"}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
