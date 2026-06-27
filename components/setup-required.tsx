export function SetupRequired({ service }: { service: string }) {
  return (
    <div className="mx-auto max-w-2xl border border-black/10 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Setup required</p>
      <h1 className="mt-2 text-3xl font-semibold">{service} is not configured</h1>
      <p className="mt-3 text-ink/70">
        Add the required values to `.env.local`, restart `npm run dev`, then run this check again.
      </p>
    </div>
  );
}
