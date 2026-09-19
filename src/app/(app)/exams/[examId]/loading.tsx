export default function ExamDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-muted" />

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}