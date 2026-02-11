"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { createUserAction } from "@/app/admin/actions";

const initialState = {
  error: null,
  success: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-xl bg-[#edf2ff] px-4 py-2 text-sm font-semibold text-[#2e4175] hover:bg-[#e4eafd] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create user"}
    </button>
  );
}

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createUserAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      autoComplete="off"
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[#132441]">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            placeholder="user@example.com"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[#132441]">
            Password (Initial password: Maxhub1234)
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            defaultValue="Maxhub1234"
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[#132441]">Name</span>
          <input
            type="text"
            name="name"
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[#132441]">Nickname</span>
          <input
            type="text"
            name="nickname"
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </label>

        <label className="space-y-1 md:max-w-[200px]">
          <span className="text-sm font-medium text-[#132441]">Role</span>
          <select
            name="role"
            defaultValue="USER"
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-[#f4c6bd] bg-[#fff2ef] px-3 py-2 text-sm text-[#9d3e2f]">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-[#bfe6cf] bg-[#f1fbf5] px-3 py-2 text-sm text-[#1f6a3b]">
          {state.success}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
