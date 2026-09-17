export default function SearchLoading() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded bg-muted" />

        <div className="h-9 w-72 rounded bg-muted" />

        <div className="h-4 w-full max-w-2xl rounded bg-muted" />
      </div>

      <div className="animate-pulse rounded-3xl border border-border bg-card p-6">
        <div className="h-14 rounded-2xl bg-muted" />

        <div className="mt-5 h-9 rounded-xl bg-muted" />
      </div>
    </div>
  );
}