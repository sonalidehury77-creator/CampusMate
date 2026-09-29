"use client";

export default function FacultyError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
      <h2 className="text-lg font-semibold text-red-900">
        Faculty workspace could not be loaded.
      </h2>

      <p className="mt-2 text-sm text-red-700">
        Please try again.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}