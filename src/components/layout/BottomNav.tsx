import { Link } from "@tanstack/react-router";
import { Home, HeartPulse, LifeBuoy, BookOpen, User } from "lucide-react";

// TODO: Logic for active state styling refinement and badge counts
export function BottomNav() {
  const items = [
    { to: "/", label: "Inicio", Icon: Home },
    { to: "/check-in", label: "Check-In", Icon: HeartPulse },
    { to: "/botiquin", label: "Botiquín", Icon: LifeBuoy },
    { to: "/recursos", label: "Recursos", Icon: BookOpen },
    { to: "/perfil", label: "Perfil", Icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex min-w-16 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
