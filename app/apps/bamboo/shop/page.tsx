import Link from "next/link";
import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const SHOP_MODULES = [
  {
    title: "Location",
    href: "/apps/bamboo/shop/location",
    description:
      "Long-form location planning with general areas, concrete rental places, and source websites.",
  },
  {
    title: "Concept",
    href: "/apps/bamboo/shop/concept",
    description:
      "Shop concept page with editable target size and target price range settings.",
  },
  {
    title: "Budget",
    href: "/apps/bamboo/shop/budget",
    description:
      "Budget planning page with editable monthly and one-time cost lines.",
  },
];

export default async function BambooShopPage() {
  await requireAppRead("BAMBOO");
  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.SHOP,
      status: { not: BambooTaskStatus.DONE },
    },
    orderBy: [{ timelineWeek: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    take: 5,
    select: {
      id: true,
      title: true,
      timelineWeek: true,
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
            { label: "Shop" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">Shop</h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Dedicated shop planning area. Split planning into location, concept,
          and budget modules.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {SHOP_MODULES.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">
              {module.description}
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
              Open module
            </p>
          </Link>
        ))}
      </section>

      <TaskCategoryPanel
        title="Shop tasks"
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.SHOP })}
        emptyLabel="No open shop tasks right now."
      />
    </main>
  );
}
