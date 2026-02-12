import Link from "next/link";
import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { BAMBOO_INVENTORY_EXTRA_IDEAS } from "@/lib/bamboo-content";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const INVENTORY_MODULES = [
  {
    title: "Budget",
    href: "/apps/bamboo/inventory/budget",
    description: "Initial and periodical inventory estimates integrated to capital overviews.",
  },
  {
    title: "Inventory brainstorm",
    href: "/apps/bamboo/inventory/brainstorm",
    description: "Initial product categories, price bands, and launch candidates.",
  },
  {
    title: "Producers contact",
    href: "/apps/bamboo/inventory/producers-contact",
    description: "Supplier pipeline and qualification template for China sourcing.",
  },
  {
    title: "Import of products",
    href: "/apps/bamboo/inventory/import-to-czech",
    description: "Practical China -> Czech Republic import process step by step.",
  },
];

export default async function BambooInventoryPage() {
  await requireAppRead("BAMBOO");
  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.INVENTORY,
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
            { label: "Inventory" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Inventory
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Inventory planning hub from early product ideas to supplier selection
          and import execution.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {INVENTORY_MODULES.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">{module.description}</p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
              Open module
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Other ideas</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Suggested expansions for stronger inventory control and better margins.
        </p>
        <ul className="mt-4 space-y-2">
          {BAMBOO_INVENTORY_EXTRA_IDEAS.map((idea) => (
            <li key={idea} className="flex items-start gap-2 text-sm text-[#314567]">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </section>

      <TaskCategoryPanel
        title="Inventory tasks"
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.INVENTORY })}
        emptyLabel="No open inventory tasks right now."
      />
    </main>
  );
}
