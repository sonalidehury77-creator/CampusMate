import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-semibold text-indigo-600">
          CampusMate Admin
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          The administrative page you requested does not exist.
        </p>

        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}