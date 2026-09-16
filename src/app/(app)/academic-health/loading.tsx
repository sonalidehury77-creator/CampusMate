export default function AcademicHealthLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />

      <div className="h-56 animate-pulse rounded-3xl bg-muted" />

      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-muted"
            />
          ),
        )}
      </div>

      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}