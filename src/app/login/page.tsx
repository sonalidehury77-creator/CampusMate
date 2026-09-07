import Link from "next/link";

import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const redirectTo =
    params.redirect || "/dashboard";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to your CampusMate account.
          </p>

          {params.error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {params.error}
            </div>
          )}

          <form action={login} className="mt-6 space-y-4">
            <input
              type="hidden"
              name="redirect"
              value={redirectTo}
            />

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-black underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}