// TODO: Logic for fetching user name from auth/profile
export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {/* TODO: Logic for notification bell / risk alerts */}
      </div>
    </header>
  );
}
