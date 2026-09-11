type ProgressBarProps = {
  value: number;
};

export function ProgressBar({
  value,
}: ProgressBarProps) {
  const safeValue = Math.min(
    100,
    Math.max(0, value),
  );

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-brand-600 transition-all"
        style={{
          width: `${safeValue}%`,
        }}
      />
    </div>
  );
}