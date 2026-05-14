import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder — VolunCare" },
      { name: "description", content: "Inicia sesión o crea tu cuenta de voluntario en VolunCare." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);

  useEffect(() => { document.title = "Acceder — VolunCare"; }, []);

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: err } =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, nombre);

    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    // Si es signup y no hay sesión, significa que necesita confirmar email
    if (mode === "signup") {
      setShowConfirmEmail(true);
      return;
    }

    navigate({ to: "/" });
  };

  if (showConfirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl text-center">
          <div className="text-5xl">📧</div>
          <h2 className="text-xl font-bold">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.
          </p>
          <button
            onClick={() => { setShowConfirmEmail(false); setMode("signin"); }}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Ya confirmé, iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">VolunCare</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cuida a quienes cuidan.</p>
        </div>

        <div className="flex rounded-lg bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 font-medium transition ${
              mode === "signin" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 font-medium transition ${
              mode === "signup" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-lg bg-primary font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting
              ? "Procesando..."
              : mode === "signin"
                ? "Entrar"
                : "Crear mi cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar aceptas el uso responsable de tus datos emocionales para tu propio cuidado.
        </p>
      </div>
    </div>
  );
}
