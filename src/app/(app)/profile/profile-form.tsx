"use client";

import { useActionState } from "react";

import {
  initialProfileState,
  updateProfile,
} from "./actions";

type ProfileFormProps = {
  fullName: string;
  phone: string;
};

export function ProfileForm({
  fullName,
  phone,
}: ProfileFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateProfile,
      initialProfileState,
    );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="profile_full_name"
          className="mb-2 block text-sm font-medium"
        >
          Full name
        </label>

        <input
          id="profile_full_name"
          name="full_name"
          defaultValue={fullName}
          maxLength={150}
          required
          className="w-full rounded-control border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label
          htmlFor="profile_phone"
          className="mb-2 block text-sm font-medium"
        >
          Phone number
        </label>

        <input
          id="profile_phone"
          name="phone"
          defaultValue={phone}
          maxLength={30}
          autoComplete="tel"
          className="w-full rounded-control border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Optional"
        />
      </div>

      {state.message && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-control bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}