import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { TaskCategoryPanel } from "@/components/bamboo/TaskCategoryPanel";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

const ESHOP_PILLARS = [
  {
    title: "Eshop model",
    points: [
      "Define primary channel split: own eshop first, marketplaces second.",
      "Set target average order value and repeat purchase target from month one.",
      "Launch with a compact assortment and expand based on conversion data.",
    ],
  },
  {
    title: "Webpage structure",
    points: [
      "Homepage: clear value proposition, best sellers, and trust signals.",
      "Category pages: bamboo by use case (kitchen, bathroom, storage, gifting).",
      "Product page: photos, material story, dimensions, shipping and returns.",
    ],
  },
  {
    title: "Conversion essentials",
    points: [
      "Fast mobile checkout and clear delivery timeline.",
      "Bundle offers and free-shipping threshold to lift basket size.",
      "Always-visible FAQ for durability, care, and certifications.",
    ],
  },
  {
    title: "Content and growth",
    points: [
      "Create recurring content plan around practical bamboo use at home.",
      "Collect customer photos/reviews and place them on high-intent pages.",
      "Run monthly SEO updates for top categories and search terms.",
    ],
  },
];

const ESHOP_NEXT_MODULES = [
  {
    title: "Shop concept",
    href: "/apps/bamboo/shop/concept",
    description: "Align eshop positioning with your physical-store concept.",
  },
  {
    title: "Shop budget",
    href: "/apps/bamboo/shop/budget",
    description: "Reserve paid traffic, tooling, and content production budget.",
  },
  {
    title: "Documents",
    href: "/apps/bamboo/documents",
    description: "Store copy, visual guidelines, and legal webpage templates.",
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
            { label: "Eshop + webpage" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Eshop + webpage
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Digital-commerce planning space for online storefront strategy, website
          structure, and conversion readiness.
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
          Related modules
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
        title="Eshop and webpage tasks"
        tasks={categoryTasks}
        href="/apps/bamboo/tasks"
        emptyLabel="No open eshop or webpage tasks right now."
      />
    </main>
  );
}
