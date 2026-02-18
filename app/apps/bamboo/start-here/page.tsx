import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_JOURNEY_STAGES } from "@/lib/bamboo-journey";

const FIRST_30_MINUTES = [
  "Open Overview and check current priorities.",
  "Review Company setup plan and confirm legal path.",
  "Add 3-5 must-do tasks with owners and deadlines.",
  "Open Inventory and write your first shortlist of products.",
];

export default async function BambooStartHerePage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Start here" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Start here
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          One-page quick start for the Bamboo app. Follow the journey in this order:
          Name brainstorm, Setup, Inventory, Shop, then Launch.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/apps/bamboo/overview"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open overview
          </Link>
          <Link
            href="/apps/bamboo/company-setup"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open company setup
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Suggested first 30 minutes
        </h2>
        <ul className="mt-4 space-y-2">
          {FIRST_30_MINUTES.map((item, index) => (
            <li
              key={item}
              className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
            >
              {index + 1}. {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BAMBOO_JOURNEY_STAGES.map((stage) => (
          <Link
            key={stage.id}
            href={stage.href}
            className="rounded-2xl border border-(--line) bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {stage.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#314567]">{stage.description}</p>
            <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase">
              Open stage
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
