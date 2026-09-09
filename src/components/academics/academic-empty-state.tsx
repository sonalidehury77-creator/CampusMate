type AcademicEmptyStateProps = {
  title: string;
  description: string;
};

export function AcademicEmptyState({
  title,
  description,
}: AcademicEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-xl">
        📚
      </div>

      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}