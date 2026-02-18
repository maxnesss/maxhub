import Link from "next/link";
import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { BAMBOO_INVENTORY_EXTRA_IDEAS } from "@/lib/bamboo-content";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const INVENTORY_MODULES = [
  {
    title: "Budget",
    href: "/apps/bamboo/inventory/budget",
    description: "Startup and recurring inventory budget.",
  },
  {
    title: "Inventory brainstorm",
    href: "/apps/bamboo/inventory/brainstorm",
    description: "Product ideas, price bands, and launch picks.",
  },
  {
    title: "Producers contact",
    href: "/apps/bamboo/inventory/producers-contact",
    description: "Supplier contacts and qualification checklist.",
  },
  {
    title: "Import of products",
    href: "/apps/bamboo/inventory/import-to-czech",
    description: "Simple China -> Czech import process.",
  },
];

export default async function BambooInventoryPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const inventoryModules = isZh
    ? INVENTORY_MODULES.map((module) => ({
      ...module,
      title:
          module.title === "Budget"
            ? "预算"
            : module.title === "Inventory brainstorm"
              ? "货品头脑风暴"
              : module.title === "Producers contact"
                ? "供应商联系"
                : "产品进口",
      description:
          module.title === "Budget"
            ? "启动与周期性货品预算。"
            : module.title === "Inventory brainstorm"
              ? "产品想法、价格带和首发清单。"
              : module.title === "Producers contact"
                ? "供应商联系人与筛选清单。"
                : "简化的中国 -> 捷克进口流程。",
    }))
    : INVENTORY_MODULES;

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
            { label: isZh ? "货品" : "Inventory" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "货品" : "Inventory"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "从产品想法到供应商与进口步骤的完整货品规划。"
            : "Inventory planning from product ideas to supplier and import steps."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {inventoryModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">{module.description}</p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
              {isZh ? "打开模块" : "Open module"}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "其他想法" : "Other ideas"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "用于提升管控与利润空间的补充建议。" : "Extra ideas to improve control and margins."}
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
        title={isZh ? "货品任务" : "Inventory tasks"}
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.INVENTORY })}
        emptyLabel={isZh ? "当前没有待办的货品任务。" : "No open inventory tasks right now."}
      />
    </main>
  );
}
