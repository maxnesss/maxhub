import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";
import Link from "next/link";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_COMPANY_SETUP_STEPS } from "@/lib/bamboo-content";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const SETUP_TIMEFRAME = [
  {
    label: "Best case",
    value: "6 weeks",
    note: "Fast coordination with notary, bank, and offices.",
  },
  {
    label: "Typical",
    value: "8 weeks",
    note: "Most realistic baseline for a single-owner setup.",
  },
  {
    label: "With buffer",
    value: "10 weeks",
    note: "Safer plan if document loops and revisions appear.",
  },
];

const STEP_LINKS: Record<number, string> = {
  1: "/apps/bamboo/name-brand",
};

export default async function BambooCompanySetupPage() {
  await requireAppRead("BAMBOO");
  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.SETUP_COMPANY,
      status: { not: BambooTaskStatus.DONE },
    },
    orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    take: 5,
    select: {
      id: true,
      title: true,
      phase: true,
      status: true,
      priority: true,
      owner: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Company setup" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Company setup plan
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Step-by-step setup plan for your Czech s.r.o.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Setup timeframe
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/apps/bamboo/target-legal-form"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              Legal form and structure
            </Link>
            <Link
              href="/apps/bamboo/company-setup/finance-requirements"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              Company setup finance requirements
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-(--text-muted)">
          Use this as a simple time guide for the setup process.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {SETUP_TIMEFRAME.map((item) => (
            <article key={item.label} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-(--text-muted)">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {BAMBOO_COMPANY_SETUP_STEPS.map((step) => (
          <article key={step.id} className="rounded-2xl border border-(--line) bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#6a7b9c] uppercase">
              Step {step.id}
            </p>
            {STEP_LINKS[step.id] ? (
              <Link
                href={STEP_LINKS[step.id]}
                className="mt-2 inline-flex text-2xl font-semibold tracking-tight text-[#162947] hover:text-[#1f3e77]"
              >
                {step.title}
              </Link>
            ) : (
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
                {step.title}
              </h2>
            )}
            <ul className="mt-4 space-y-2">
              {step.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2 text-sm text-[#314567]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <TaskCategoryPanel
        title="Company setup tasks"
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.SETUP_COMPANY })}
        emptyLabel="No open setup-company tasks right now."
      />
    </main>
  );
}
