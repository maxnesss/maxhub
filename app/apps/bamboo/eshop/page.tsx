import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { prisma } from "@/prisma";

const ESHOP_PILLARS = [
  {
    title: "Eshop model",
    points: [
      "Set channel priority: own eshop first, marketplaces second.",
      "Track average order value and repeat purchases from month one.",
      "Launch with a small assortment and expand using real data.",
    ],
  },
  {
    title: "Webpage structure",
    points: [
      "Homepage: clear value, best sellers, and trust signals.",
      "Category pages by use case (kitchen, bathroom, storage, gifts).",
      "Product page: photos, material story, dimensions, shipping, returns.",
    ],
  },
  {
    title: "Conversion essentials",
    points: [
      "Fast mobile checkout and clear delivery timing.",
      "Use bundles and free-shipping threshold to increase basket size.",
      "Keep FAQ visible (care, durability, certifications).",
    ],
  },
  {
    title: "Content and growth",
    points: [
      "Create recurring content around daily bamboo use.",
      "Collect customer photos/reviews and place them on key pages.",
      "Do monthly SEO updates for top categories and keywords.",
    ],
  },
];

const ESHOP_NEXT_MODULES = [
  {
    title: "Shop concept",
    href: "/apps/bamboo/shop/concept",
    description: "Keep eshop positioning aligned with shop concept.",
  },
  {
    title: "Shop budget",
    href: "/apps/bamboo/shop/budget",
    description: "Set budget for ads, tools, and content.",
  },
  {
    title: "Documents",
    href: "/apps/bamboo/documents",
    description: "Store copy, visual rules, and legal templates.",
  },
];

const ESHOP_TASK_KEYWORDS = [
  "eshop",
  "e-shop",
  "webpage",
  "website",
  "online shop",
  "online store",
  "domain",
  "checkout",
];

export default async function BambooEshopPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const eshopTaskFilters = ESHOP_TASK_KEYWORDS.flatMap((keyword) => [
    { title: { contains: keyword, mode: "insensitive" as const } },
    { subCategory: { contains: keyword, mode: "insensitive" as const } },
  ]);

  const categoryTasks = await prisma.bambooTask.findMany({
    where: {
      status: { not: BambooTaskStatus.DONE },
      OR: eshopTaskFilters,
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
            { label: isZh ? "网店 + 网站" : "Eshop + webpage" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "网店 + 网站" : "Eshop + webpage"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "用于线上商店策略、网站结构和转化优化的规划区。"
            : "Planning area for online store strategy, website structure, and conversion."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {ESHOP_PILLARS.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border border-(--line) bg-white p-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
              {pillar.title}
            </h2>
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

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "相关模块" : "Related modules"}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ESHOP_NEXT_MODULES.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <h3 className="text-sm font-semibold text-[#1a2b49]">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">
                {module.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <TaskCategoryPanel
        title={isZh ? "网店与网站任务" : "Eshop and webpage tasks"}
        tasks={categoryTasks}
        href="/apps/bamboo/tasks"
        emptyLabel={isZh ? "当前没有待办的网店或网站任务。" : "No open eshop or webpage tasks right now."}
      />
    </main>
  );
}
