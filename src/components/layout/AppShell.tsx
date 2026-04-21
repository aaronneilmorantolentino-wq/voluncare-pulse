import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title={title} />
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
