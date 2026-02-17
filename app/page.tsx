import type { Metadata } from "next";
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

const featureDetails = [
  {
    title: "Project-first planning",
    body: "Track project priorities, maintain structured notes, and keep your delivery path visible without switching tools.",
  },
  {
    title: "Modular app architecture",
    body: "Launch focused internal apps like Bamboo, Workout, Calendar, and Skating Bible inside one consistent shell.",
  },
  {
    title: "Permission-aware access",
    body: "Control who can read and edit each app while keeping favorites and navigation personalized per user.",
  },
];

const faqs = [
  {
    question: "What is MaxHub for?",
    answer:
      "MaxHub is a private productivity workspace for running projects and specialized internal tools from one place.",
  },
  {
    question: "Can I grow it over time?",
    answer:
      "Yes. The platform is designed as a module hub so you can add new apps and workflows without replacing your foundation.",
  },
  {
    question: "Is MaxHub public or internal?",
    answer:
      "MaxHub is built for authenticated usage. Public visitors can view the landing page, while tools require login and permissions.",
  },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MaxHub",
  url: "https://maxhub.vercel.app/",
  description:
    "MaxHub is your personal workspace for managing projects, ideas, and future apps in one focused environment.",
};

export const metadata: Metadata = {
  title: "MaxHub - Personal Workspace for Projects and Future Apps",
  description:
    "MaxHub is your personal workspace for managing projects, ideas, and future apps in one focused environment.",
};

export default async function Home() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header>
          <TopNav current="home" />
        </header>

        <section className="animate-fade-up mt-10 grid gap-6 rounded-3xl border border-(--line) bg-(--surface-1) p-8 shadow-[0_20px_45px_-34px_rgba(19,33,58,0.55)] md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#40538a] uppercase">
              Personal Hub
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-[#12223c] sm:text-5xl">
              Welcome to MaxHub
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-(--text-muted)">
              {isSignedIn
                ? "A clean space to manage your apps. You are signed in and ready to continue your work."
                : "A clean space to manage your projects and internal apps. Log in to access your full workspace."}
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
            <div className="animate-soft-float absolute -top-4 -right-4 h-16 w-16 rounded-2xl bg-[#edf7ff]" />
            <p className="text-xs font-semibold tracking-[0.14em] text-[#5c6f92] uppercase">
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
              className="animate-fade-up rounded-2xl border border-(--line) bg-white p-6"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.color}`}>
                Detail
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[#182a47]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Why teams build on MaxHub</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-muted)">
            MaxHub combines a calm, focused interface with practical app modules so you can run planning, execution,
            and tracking in one environment. Instead of scattering workflows across disconnected tools, MaxHub helps
            you keep operations centralized, permission-aware, and ready for future expansion.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {featureDetails.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-[#e4eaf8] bg-[#fbfdff] p-4">
                <h3 className="text-sm font-semibold text-[#1a2b49]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--text-muted)">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-xl border border-[#e4eaf8] bg-[#fbfdff] p-4">
                <h3 className="text-sm font-semibold text-[#1a2b49]">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-(--text-muted)">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-6 rounded-2xl border border-(--line) bg-white px-6 py-4 text-sm text-(--text-muted)">
          MaxHub helps you organize projects, ideas, and internal apps in one streamlined workspace.
        </footer>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </div>
  );
}
