import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const FINANCE_PILLARS = [
  {
    title: "Revenue model",
    points: [
      "Start with focused product categories for bamboo home goods.",
      "Track unit economics per category from first month.",
      "Add subscription or repeat-order strategy once retention data exists.",
    ],
  },
  {
    title: "Operating budget",
    points: [
      "Separate one-time setup costs from monthly operating costs.",
      "Set monthly limits for inventory, marketing, and tools.",
      "Review variance between plan and actual every week.",
    ],
  },
  {
    title: "Cash and runway",
    points: [
      "Maintain visible cash buffer targets.",
      "Estimate runway in months based on current burn.",
      "Define trigger points for cost reductions or growth investments.",
    ],
  },
  {
    title: "Reporting cadence",
    points: [
      "Weekly: cash in/out and urgent blockers.",
      "Monthly: P&L overview and margin by product line.",
      "Quarterly: strategy review and growth priorities.",
    ],
  },
];

export default async function BambooFinancePage() {
  await requireAppRead("BAMBOO");
  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.FINANCE,
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
            { label: "Finance setup" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Finance setup
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          General finance category for planning how the business will run after
          legal setup is complete.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {FINANCE_PILLARS.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border border-(--line) bg-white p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">{pillar.title}</h2>
            <ul className="mt-4 space-y-2">
              {pillar.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-[#314567]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <TaskCategoryPanel
        title="Finance tasks"
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.FINANCE })}
        emptyLabel="No open finance tasks right now."
      />
    </main>
  );
}
