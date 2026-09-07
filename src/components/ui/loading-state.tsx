export function LoadingState({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
          aria-hidden="true"
        />

        <span>{label}</span>
      </div>
    </div>
  );
}