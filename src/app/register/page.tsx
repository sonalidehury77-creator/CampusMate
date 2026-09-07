import Link from "next/link";

import { register } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Create your CampusMate account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Register to start using CampusMate.
          </p>

          {params.error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {params.error}
            </div>
          )}

          {params.success && (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {params.success}
            </div>
          )}

          <form action={register} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                placeholder="Enter your full name"
              />
            </div>

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
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-black underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}