import Link from "next/link";
import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { bambooTaskFilterHref } from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const SHOP_MODULES = [
  {
    title: "Location",
    href: "/apps/bamboo/shop/location",
    description:
      "Location planning with areas, rental places, and source websites.",
  },
  {
    title: "Concept",
    href: "/apps/bamboo/shop/concept",
    description: "Shop concept with editable size and rent targets.",
  },
  {
    title: "Budget",
    href: "/apps/bamboo/shop/budget",
    description: "Editable monthly and one-time shop costs.",
  },
];

export default async function BambooShopPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const shopModules = isZh
    ? SHOP_MODULES.map((module) => ({
      ...module,
      title:
          module.title === "Location"
            ? "选址"
            : module.title === "Concept"
              ? "概念"
              : "预算",
      description:
          module.title === "Location"
            ? "选址规划：区域、租赁点位与信息来源网站。"
            : module.title === "Concept"
              ? "门店概念，支持面积与租金目标编辑。"
              : "可编辑的月度与一次性门店成本。",
    }))
    : SHOP_MODULES;

  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      category: BambooTaskCategory.SHOP,
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
            { label: isZh ? "门店" : "Shop" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "门店" : "Shop"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "门店规划模块：选址、概念与预算。"
            : "Shop planning area with location, concept, and budget modules."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {shopModules.map((module) => (
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
              {isZh ? "打开模块" : "Open module"}
            </p>
          </Link>
        ))}
      </section>

      <TaskCategoryPanel
        title={isZh ? "门店任务" : "Shop tasks"}
        tasks={categoryTasks}
        href={bambooTaskFilterHref({ category: BambooTaskCategory.SHOP })}
        emptyLabel={isZh ? "当前没有待办的门店任务。" : "No open shop tasks right now."}
      />
    </main>
  );
}
