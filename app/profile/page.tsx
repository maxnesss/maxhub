import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { TopNav } from "@/components/layout/TopNav";

import { signOutAction } from "./actions";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="profile" />

      <section className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#657597]">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Your account
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#6d7d9c]">Email</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {session.user.email ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#6d7d9c]">Name</p>
            <p className="mt-2 text-sm font-medium text-[#1a2b49]">
              {session.user.name ?? "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0e8f6] bg-[#fbfdff] p-5 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-[#6d7d9c]">User ID</p>
            <p className="mt-2 break-all text-sm font-medium text-[#1a2b49]">
              {session.user.id}
            </p>
          </div>
        </div>

        <form action={signOutAction} className="mt-8">
          <button
            type="submit"
            className="cursor-pointer rounded-xl border border-[#f0cbc1] bg-[#fff4f1] px-5 py-3 text-sm font-semibold text-[#9a4934] hover:bg-[#ffece7]"
          >
            Sign off
          </button>
        </form>
      </section>
    </main>
  );
}
