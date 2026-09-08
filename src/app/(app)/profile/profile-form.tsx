"use client";

import { useActionState } from "react";

import {
  updateProfile,
  type ProfileState,
} from "./actions";

const initialState: ProfileState = {
  message: null,
  errors: {},
};

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
      initialState,
    );

  const errors = state?.errors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {state?.message && (
        <div
          role="alert"
          className="rounded-xl border border-border bg-muted px-4 py-3 text-sm"
        >
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium"
        >
          Full Name
        </label>

        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />

        {errors.fullName?.[0] && (
          <p className="mt-1 text-sm text-red-600">
            {errors.fullName[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium"
        >
          Phone Number
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />

        {errors.phone?.[0] && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phone[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save Changes"}
      </button>
    </form>
  );
}