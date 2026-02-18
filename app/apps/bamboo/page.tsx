import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { BambooJourneyControls } from "@/components/bamboo/BambooJourneyControls";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import {
  getBudgetTotals,
  getEstimatedSetupCostLabel,
  getInventoryBudgetBreakdown,
  getRecommendedCapitalLabel,
} from "@/lib/bamboo-budget";
import {
  BAMBOO_DOCUMENT_TILES,
  BAMBOO_ESHOP_TILES,
  BAMBOO_GENERAL_TILES,
  BAMBOO_INVENTORY_TILES,
  BAMBOO_OVERVIEW_STATS,
  BAMBOO_SHOP_TILES,
  BAMBOO_SETUP_COMPANY_TILES,
} from "@/lib/bamboo-content";
import {
  localizeBambooOverviewStatLabel,
  localizeBambooOverviewStatValue,
  localizeBambooTile,
} from "@/lib/bamboo-content-i18n";
import {
  BAMBOO_TASK_CATEGORY_OPTIONS,
  bambooTaskFilterHref,
  getBambooTaskCategoryLabels,
  getBambooTaskPhaseLabels,
} from "@/lib/bamboo-tasks";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { getBambooCopy } from "@/lib/bamboo-i18n";
import { prisma } from "@/prisma";

const OVERVIEW_STAT_LINKS: Record<string, string> = {
  "target legal form": "/apps/bamboo/target-legal-form",
  "estimated setup cost": "/apps/bamboo/estimated-setup-cost",
  "recommended capital": "/apps/bamboo/recommended-capital",
};

export default async function BambooPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const copy = getBambooCopy(locale);
  const taskCategoryLabels = getBambooTaskCategoryLabels(locale);
  const taskPhaseLabels = getBambooTaskPhaseLabels(locale);

  const [budgetItems, inventoryBudget, nextTasks, taskCategoryStatusRows, capitalScenario] =
    await Promise.all([
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
    prisma.bambooTask.findMany({
      where: { status: { not: BambooTaskStatus.DONE } },
      orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        category: true,
        phase: true,
      },
    }),
    prisma.bambooTask.groupBy({
      by: ["category", "status"],
      _count: { _all: true },
    }),
    prisma.bambooCapitalScenario.findUnique({
      where: { id: "default" },
      select: {
        operatingMonths: true,
        reservePercent: true,
      },
    }),
  ]);

  const budgetTotals = getBudgetTotals(budgetItems);
  const inventoryBudgetTotals = getInventoryBudgetBreakdown(inventoryBudget);
  const estimatedSetupCostLabel = getEstimatedSetupCostLabel(
    budgetTotals.oneTime + inventoryBudgetTotals.initialTotal,
  );
  const recommendedCapitalLabel = getRecommendedCapitalLabel(
    budgetTotals.oneTime + inventoryBudgetTotals.initialTotal,
    budgetTotals.monthly,
    inventoryBudgetTotals.periodicalTotal,
    capitalScenario?.operatingMonths ?? 3,
    (capitalScenario?.reservePercent ?? 25) / 100,
  );
  const overviewStats = BAMBOO_OVERVIEW_STATS.map((stat) => {
    const value =
      stat.label === "Estimated setup cost"
        ? estimatedSetupCostLabel
        : stat.label === "Recommended capital"
          ? recommendedCapitalLabel
          : stat.value;

    return {
      sourceLabel: stat.label,
      label: localizeBambooOverviewStatLabel(stat.label, locale),
      value: localizeBambooOverviewStatValue(value, locale),
    };
  });
  const generalTiles = BAMBOO_GENERAL_TILES.map((tile) => localizeBambooTile(tile, locale));
  const inventoryTiles = BAMBOO_INVENTORY_TILES.map((tile) => localizeBambooTile(tile, locale));
  const setupCompanyTiles = BAMBOO_SETUP_COMPANY_TILES.map((tile) => localizeBambooTile(tile, locale));
  const shopTiles = BAMBOO_SHOP_TILES.map((tile) => localizeBambooTile(tile, locale));
  const eshopTiles = BAMBOO_ESHOP_TILES.map((tile) => localizeBambooTile(tile, locale));
  const documentTiles = BAMBOO_DOCUMENT_TILES.map((tile) => localizeBambooTile(tile, locale));
  const openCountByCategory = new Map<string, number>();
  for (const row of taskCategoryStatusRows) {
    if (row.status === BambooTaskStatus.DONE) {
      continue;
    }

    openCountByCategory.set(
      row.category,
      (openCountByCategory.get(row.category) ?? 0) + row._count._all,
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {copy.workspaceTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {copy.workspaceDescription}
        </p>
        <div className="mt-5">
          <Link
            href="/apps/bamboo/start-here"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {copy.openStartHere}
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          OVERVIEW_STAT_LINKS[stat.sourceLabel.toLocaleLowerCase()] ? (
            <Link
              key={stat.sourceLabel}
              href={OVERVIEW_STAT_LINKS[stat.sourceLabel.toLocaleLowerCase()]}
              className="group block rounded-2xl border border-(--line) bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
                {stat.value}
              </p>
            <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开详情" : "Open details"}
              </p>
            </Link>
          ) : (
            <article key={stat.sourceLabel} className="rounded-2xl border border-(--line) bg-white p-5">
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

      <BambooJourneyControls locale={locale} />

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            {locale === "zh" ? "任务与阶段" : "Tasks and phases"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/apps/bamboo/tasks"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              {locale === "zh" ? "打开看板" : "Open board"}
            </Link>
            <Link
              href="/apps/bamboo/timeline"
              className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
            >
              {locale === "zh" ? "打开阶段概览" : "Open phase overview"}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {BAMBOO_TASK_CATEGORY_OPTIONS.map((category) => (
            <Link
              key={category}
              href={bambooTaskFilterHref({ category })}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3"
            >
              <p className="text-xs font-semibold tracking-[0.1em] text-[#5b6c8d] uppercase">
                {taskCategoryLabels[category]}
              </p>
              <p className="mt-1 text-xl font-semibold text-[#1a2b49]">
                {openCountByCategory.get(category) ?? 0}
              </p>
              <p className="mt-1 text-xs text-(--text-muted)">
                {locale === "zh" ? "开放任务" : "open tasks"}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {nextTasks.length > 0 ? (
            nextTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]"
              >
                {taskPhaseLabels[task.phase]} • {task.title} ({taskCategoryLabels[task.category]})
              </div>
            ))
          ) : (
            <p className="text-sm text-(--text-muted)">
              {locale === "zh" ? "还没有开放任务。" : "No open tasks yet."}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "通用分类" : "General categories"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {generalTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "货品" : "Inventory"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {inventoryTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "公司设立" : "Setup company"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {setupCompanyTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "门店" : "Shop"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shopTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "网店" : "Eshop"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {eshopTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          {locale === "zh" ? "文档" : "Documents"}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {documentTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group block rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#162947]">{tile.title}</h2>
                <span className="rounded-full border border-[#d8e2f4] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#5a6b8f]">
                  {tile.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-muted)">{tile.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
                {locale === "zh" ? "打开模块" : "Open section"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
