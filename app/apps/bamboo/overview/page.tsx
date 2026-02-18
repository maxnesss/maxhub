import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { BambooSectionProgress } from "@/components/bamboo/BambooSectionProgress";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  BAMBOO_DOCUMENT_TILES,
  BAMBOO_ESHOP_TILES,
  BAMBOO_GENERAL_TILES,
  BAMBOO_INVENTORY_TILES,
  BAMBOO_SHOP_TILES,
  BAMBOO_SETUP_COMPANY_TILES,
} from "@/lib/bamboo-content";
import { getBambooSectionProgress } from "@/lib/bamboo-journey";
import { requireAppRead } from "@/lib/authz";
import {
  getBudgetTotals,
  getEstimatedSetupCostLabel,
  getInventoryBudgetBreakdown,
  getRecommendedCapitalLabel,
} from "@/lib/bamboo-budget";
import {
  BAMBOO_TASK_CATEGORY_LABELS,
  BAMBOO_TASK_PHASE_LABELS,
  BAMBOO_TASK_STATUS_LABELS,
  BAMBOO_TASK_STATUS_STYLES,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const OVERVIEW_STAT_LINKS: Record<string, string> = {
  "target legal form": "/apps/bamboo/target-legal-form",
  "estimated setup cost": "/apps/bamboo/estimated-setup-cost",
  "recommended capital": "/apps/bamboo/recommended-capital",
};

export default async function BambooOverviewPage() {
  await requireAppRead("BAMBOO");

  const [
    nextTasks,
    taskStatusRows,
    taskCategoryStatusRows,
    shortlist,
    inventoryIdeaCount,
    producerCount,
    inventoryImageCount,
    locationCount,
    rentalPlaceCount,
    websiteCount,
    charterExists,
    budgetItems,
    inventoryBudget,
    capitalScenario,
  ] = await Promise.all([
    prisma.bambooTask.findMany({
      where: { status: { not: BambooTaskStatus.DONE } },
      orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        phase: true,
        owner: true,
        category: true,
      },
    }),
    prisma.bambooTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.bambooTask.groupBy({
      by: ["category", "status"],
      _count: { _all: true },
    }),
    prisma.bambooNameIdea.findMany({
      where: { shortlisted: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 6,
      select: {
        id: true,
        name: true,
        category: true,
      },
    }),
    prisma.bambooInventoryIdea.count(),
    prisma.bambooProducerContact.count(),
    prisma.bambooInventoryImage.count(),
    prisma.bambooShopLocation.count(),
    prisma.bambooShopRentalPlace.count(),
    prisma.bambooShopWebsite.count(),
    prisma.bambooProjectCharter.findUnique({
      where: { id: "default" },
      select: { updatedAt: true },
    }),
    prisma.bambooShopBudgetItem.findMany({
      select: {
        monthlyCost: true,
        oneTimeCost: true,
      },
    }),
    prisma.bambooInventoryBudget.findUnique({
      where: { id: "default" },
      select: {
        initialInventoryBuy: true,
        initialTransportation: true,
        initialTaxesImportFees: true,
        initialTransportToShop: true,
        initialLabelling: true,
        periodicalInventoryBuy: true,
        periodicalTransportation: true,
        periodicalTaxesImportFees: true,
        periodicalTransportToShop: true,
        periodicalLabelling: true,
      },
    }),
    prisma.bambooCapitalScenario.findUnique({
      where: { id: "default" },
      select: {
        operatingMonths: true,
        reservePercent: true,
      },
    }),
  ]);

  const statusCountMap = new Map(taskStatusRows.map((row) => [row.status, row._count._all]));
  const todoCount = statusCountMap.get(BambooTaskStatus.TODO) ?? 0;
  const inProgressCount = statusCountMap.get(BambooTaskStatus.IN_PROGRESS) ?? 0;
  const doneCount = statusCountMap.get(BambooTaskStatus.DONE) ?? 0;
  const totalTaskCount = todoCount + inProgressCount + doneCount;
  const completionPercent =
    totalTaskCount > 0 ? Math.round((doneCount / totalTaskCount) * 100) : 0;
  const sectionProgress = getBambooSectionProgress(taskCategoryStatusRows);

  const budgetTotals = getBudgetTotals(budgetItems);
  const inventoryBudgetTotals = getInventoryBudgetBreakdown(inventoryBudget);
  const estimatedSetupCost = getEstimatedSetupCostLabel(
    budgetTotals.oneTime + inventoryBudgetTotals.initialTotal,
  );
  const recommendedCapital = getRecommendedCapitalLabel(
    budgetTotals.oneTime + inventoryBudgetTotals.initialTotal,
    budgetTotals.monthly,
    inventoryBudgetTotals.periodicalTotal,
    capitalScenario?.operatingMonths ?? 3,
    (capitalScenario?.reservePercent ?? 25) / 100,
  );

  const dynamicOverviewStats = [
    { label: "Target legal form", value: "s.r.o. (Czech Republic)" },
    { label: "Estimated setup time", value: "6-10 weeks" },
    { label: "Estimated setup cost", value: estimatedSetupCost },
    { label: "Recommended capital", value: recommendedCapital },
    {
      label: "Task completion",
      value: `${completionPercent}% (${doneCount}/${totalTaskCount})`,
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Bamboo overview
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Quick summary of project status, priorities, and next actions.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicOverviewStats.map((stat) => (
          OVERVIEW_STAT_LINKS[stat.label.toLocaleLowerCase()] ? (
            <Link
              key={stat.label}
              href={OVERVIEW_STAT_LINKS[stat.label.toLocaleLowerCase()]}
              className="group block rounded-2xl border border-(--line) bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
                {stat.value}
              </p>
              <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                Open details
              </p>
            </Link>
          ) : (
            <article key={stat.label} className="rounded-2xl border border-(--line) bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
                {stat.value}
              </p>
            </article>
          )
        ))}
      </section>

      <BambooSectionProgress
        title="Journey progress"
        description="Task completion across Name brainstorm, Setup, Inventory, Shop, and Launch."
        sections={sectionProgress}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Next actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[BambooTaskStatus.TODO, BambooTaskStatus.IN_PROGRESS, BambooTaskStatus.DONE].map(
              (status) => (
                <span
                  key={status}
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[status]}`}
                >
                  {BAMBOO_TASK_STATUS_LABELS[status]}: {statusCountMap.get(status) ?? 0}
                </span>
              ),
            )}
          </div>
          <ul className="mt-4 space-y-3">
            {nextTasks.length > 0 ? (
              nextTasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
                  <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {BAMBOO_TASK_PHASE_LABELS[task.phase]} • {BAMBOO_TASK_CATEGORY_LABELS[task.category]} • Owner: {task.owner}
                  </p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 text-sm text-(--text-muted)">
                No open tasks yet.
              </li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Name shortlist</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Shortlist pulled from the Name brainstorm page.
          </p>
          <ul className="mt-4 space-y-2">
            {shortlist.length > 0 ? (
              shortlist.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
                >
                  {item.name}
                  <span className="ml-2 text-xs text-(--text-muted)">({item.category})</span>
                </li>
              ))
            ) : (
              <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-(--text-muted)">
                No shortlisted names yet.
              </li>
            )}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Dynamic module snapshot
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Live counters from key Bamboo modules.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/apps/bamboo/inventory/brainstorm"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Inventory ideas
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {inventoryIdeaCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/inventory/producers-contact"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Producers
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {producerCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/inventory/brainstorm"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Gallery images
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {inventoryImageCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/shop/location"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              General locations
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {locationCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/shop/location"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Rental places
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {rentalPlaceCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/shop/location"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Location websites
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {websiteCount}
            </p>
          </Link>
          <Link
            href="/apps/bamboo/project-charter"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              Project charter
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {charterExists ? "Ready" : "Missing"}
            </p>
            {charterExists ? (
              <p className="mt-1 text-xs text-(--text-muted)">Maintained</p>
            ) : (
              <p className="mt-1 text-xs text-(--text-muted)">Needs setup</p>
            )}
          </Link>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/start-here"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open start here
        </Link>
        <Link
          href="/apps/bamboo/tasks"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open tasks
        </Link>
        <Link
          href="/apps/bamboo/project-charter"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open project charter
        </Link>
        <Link
          href="/apps/bamboo/timeline"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open phase overview
        </Link>
        <Link
          href="/apps/bamboo/company-setup"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open company setup
        </Link>
        <Link
          href="/apps/bamboo/inventory"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open inventory
        </Link>
        <Link
          href="/apps/bamboo/shop"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open shop
        </Link>
        <Link
          href="/apps/bamboo/eshop"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open eshop
        </Link>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            General categories
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_GENERAL_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Inventory
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_INVENTORY_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Setup company
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SETUP_COMPANY_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Shop
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_SHOP_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-1">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Eshop
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_ESHOP_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Documents
          </h2>
          <ul className="mt-4 space-y-2">
            {BAMBOO_DOCUMENT_TILES.map((tile) => (
              <li
                key={tile.href}
                className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {tile.title}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/finance"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open finance setup
        </Link>
        <Link
          href="/apps/bamboo/company-setup/finance-requirements"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          Open company setup finance requirements
        </Link>
      </section>
    </main>
  );
}
