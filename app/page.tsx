import Link from "next/link";

import { auth } from "@/auth";
import { TopNav } from "@/components/layout/TopNav";

const highlights = [
  {
    title: "Focused workspace",
    description: "One home for projects, notes, and app modules you add over time.",
    color: "bg-[#e9f7ff] text-[#2f5d80]",
  },
  {
    title: "Simple access",
    description: "Sign in first, then keep all your internal tools under one account.",
    color: "bg-[#ecf2ff] text-[#31457d]",
  },
  {
    title: "Ready to expand",
    description: "Start minimal now and grow MaxHub into your personal control panel.",
    color: "bg-[#fff1ea] text-[#835642]",
  },
];

export default async function Home() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <TopNav current="home" />

        <section className="animate-fade-up mt-10 grid gap-6 rounded-3xl border border-[var(--line)] bg-[var(--surface-1)] p-8 shadow-[0_20px_45px_-34px_rgba(19,33,58,0.55)] md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#40538a]">
              Personal Hub
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-[#12223c] sm:text-5xl">
              Welcome to MaxHub
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-[var(--text-muted)]">
              {isSignedIn
                ? "A clean space to manage your apps. You are signed in."
                : "A clean space to manage your apps. Please log in to continue."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {!isSignedIn ? (
                <Link
                  href="/login"
                  className="rounded-xl bg-[#edf2ff] px-5 py-3 text-sm font-semibold text-[#2d4071] hover:bg-[#e3eaff]"
                >
                  Log in
                </Link>
              ) : null}
              <Link
                href="/apps"
                className="rounded-xl border border-[#d9e2f3] px-5 py-3 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Open Apps
              </Link>
            </div>
          </div>

          <aside className="relative rounded-2xl border border-[#dfe7f5] bg-[#fbfdff] p-5">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-2xl bg-[#edf7ff] animate-soft-float" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c6f92]">
              Overview
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#51607a]">
              <li className="rounded-lg border border-[#e5ebf7] bg-white px-3 py-2">App navigation ready</li>
              <li className="rounded-lg border border-[#e5ebf7] bg-white px-3 py-2">Auth flow connected</li>
              <li className="rounded-lg border border-[#e5ebf7] bg-white px-3 py-2">Prisma + PostgreSQL setup done</li>
            </ul>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="animate-fade-up rounded-2xl border border-[var(--line)] bg-white p-6"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.color}`}>
                Detail
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[#182a47]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
