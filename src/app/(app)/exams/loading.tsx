export default function ExamsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />

      <div className="h-40 animate-pulse rounded-2xl bg-muted" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}