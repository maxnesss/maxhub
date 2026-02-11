"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction } from "@/app/login/actions";

type LoginState = {
  error: string | null;
};

const initialLoginState: LoginState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[#edf2ff] px-5 py-3 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#2a3d67]">Email</span>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-xl border border-[#dbe3f3] bg-white px-4 py-3 text-sm text-[#1f2f4f] outline-none focus:border-[#90a7f8]"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#2a3d67]">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-[#dbe3f3] bg-white px-4 py-3 text-sm text-[#1f2f4f] outline-none focus:border-[#90a7f8]"
          placeholder="••••••••"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-[#fff2ee] px-3 py-2 text-sm text-[#9b4f39]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
