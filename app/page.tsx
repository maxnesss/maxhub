import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-black/60">maxhub</p>
        <h1 className="mt-2 text-3xl font-semibold text-black">
          Personal hub initialized.
        </h1>
        <p className="mt-3 text-black/70">
          Stack is wired with Next.js 16, React 19, TypeScript 5, Tailwind 4,
          NextAuth v5 beta, Prisma 7, and PostgreSQL tooling.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Auth status</h2>
        <p className="mt-3 text-black/70">
          {session?.user
            ? `Signed in as ${session.user.email}`
            : "No session yet. Use the NextAuth route once environment variables are set."}
        </p>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Next steps</h2>
        <ul className="mt-3 list-disc pl-5 text-black/80">
          <li>Copy `.env.example` to `.env` and set a real `DATABASE_URL`.</li>
          <li>Run `npm run db:generate` and `npm run db:migrate`.</li>
          <li>Create your first user with `npm run create:user -- ...`.</li>
        </ul>
      </section>
    </main>
  );
}
