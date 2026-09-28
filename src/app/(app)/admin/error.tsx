"use client";

export default function AdminError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          !
        </div>

        <h1 className="mt-4 text-xl font-bold text-slate-950">
          Admin workspace could not be loaded
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Something went wrong while loading administrative
          data. Your database and authorization state have
          not been changed.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}