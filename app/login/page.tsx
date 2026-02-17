import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { TopNav } from "@/components/layout/TopNav";
import { getCurrentUserContext } from "@/lib/authz";

export default async function LoginPage() {
  const user = await getCurrentUserContext();

  if (user) {
    redirect("/profile");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav />

      <section className="mx-auto mt-12 w-full max-w-lg rounded-3xl border border-(--line) bg-white p-8 shadow-[0_20px_40px_-30px_rgba(19,33,58,0.45)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#657597] uppercase">
          Login
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#132441]">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--text-muted)">
          Sign in with your credentials to continue to your MaxHub profile and
          apps.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
