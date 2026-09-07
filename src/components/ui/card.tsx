import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white",
        "shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: CardProps) {
  return (
    <div className={cn("p-6 pb-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: CardProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight text-slate-900",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
  className,
}: CardProps) {
  return (
    <p
      className={cn(
        "mt-1 text-sm leading-6 text-slate-500",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: CardProps) {
  return (
    <div className={cn("p-6 pt-3", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "flex items-center border-t border-slate-100 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}