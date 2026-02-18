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
import {
  localizeBambooOverviewStatLabel,
  localizeBambooOverviewStatValue,
  localizeBambooTile,
} from "@/lib/bamboo-content-i18n";
import { getBambooSectionProgress } from "@/lib/bamboo-journey";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  getBudgetTotals,
  getEstimatedSetupCostLabel,
  getInventoryBudgetBreakdown,
  getRecommendedCapitalLabel,
} from "@/lib/bamboo-budget";
import {
  getBambooTaskCategoryLabels,
  getBambooTaskPhaseLabels,
  getBambooTaskStatusLabels,
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
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const taskCategoryLabels = getBambooTaskCategoryLabels(locale);
  const taskPhaseLabels = getBambooTaskPhaseLabels(locale);
  const taskStatusLabels = getBambooTaskStatusLabels(locale);

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
  const sectionProgress = getBambooSectionProgress(taskCategoryStatusRows, locale);

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
  ].map((stat) => ({
    sourceLabel: stat.label,
    label: localizeBambooOverviewStatLabel(stat.label, locale),
    value: localizeBambooOverviewStatValue(stat.value, locale),
  }));
  const generalTiles = BAMBOO_GENERAL_TILES.map((tile) => localizeBambooTile(tile, locale));
  const inventoryTiles = BAMBOO_INVENTORY_TILES.map((tile) => localizeBambooTile(tile, locale));
  const setupCompanyTiles = BAMBOO_SETUP_COMPANY_TILES.map((tile) => localizeBambooTile(tile, locale));
  const shopTiles = BAMBOO_SHOP_TILES.map((tile) => localizeBambooTile(tile, locale));
  const eshopTiles = BAMBOO_ESHOP_TILES.map((tile) => localizeBambooTile(tile, locale));
  const documentTiles = BAMBOO_DOCUMENT_TILES.map((tile) => localizeBambooTile(tile, locale));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "概览" : "Overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "Bamboo 概览" : "Bamboo overview"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "项目状态、优先级与下一步行动的快速摘要。"
            : "Quick summary of project status, priorities, and next actions."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicOverviewStats.map((stat) => (
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
                {isZh ? "打开详情" : "Open details"}
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

      <BambooSectionProgress
        title={locale === "zh" ? "旅程进度" : "Journey progress"}
        description={
          locale === "zh"
            ? "按阶段查看任务完成度：命名、设立、货品、门店和启动。"
            : "Task completion across Name brainstorm, Setup, Inventory, Shop, and Launch."
        }
        sections={sectionProgress}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "下一步行动" : "Next actions"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[BambooTaskStatus.TODO, BambooTaskStatus.IN_PROGRESS, BambooTaskStatus.DONE].map(
              (status) => (
                <span
                  key={status}
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[status]}`}
                >
                  {taskStatusLabels[status]}: {statusCountMap.get(status) ?? 0}
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
                    {taskPhaseLabels[task.phase]} • {taskCategoryLabels[task.category]} • {isZh ? "负责人" : "Owner"}: {task.owner}
                  </p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 text-sm text-(--text-muted)">
                {isZh ? "还没有开放任务。" : "No open tasks yet."}
              </li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "名称候选" : "Name shortlist"}
          </h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            {isZh
              ? "候选列表来自 Name brainstorm 页面。"
              : "Shortlist pulled from the Name brainstorm page."}
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
                {isZh ? "还没有候选名称。" : "No shortlisted names yet."}
              </li>
            )}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "动态模块快照" : "Dynamic module snapshot"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "来自 Bamboo 关键模块的实时计数。" : "Live counters from key Bamboo modules."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/apps/bamboo/inventory/brainstorm"
            className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 hover:bg-white"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
              {isZh ? "货品想法" : "Inventory ideas"}
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
              {isZh ? "供应商" : "Producers"}
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
              {isZh ? "图库图片" : "Gallery images"}
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
              {isZh ? "区域位置" : "General locations"}
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
              {isZh ? "租赁点位" : "Rental places"}
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
              {isZh ? "选址网站" : "Location websites"}
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
              {isZh ? "项目章程" : "Project charter"}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {charterExists ? (isZh ? "已就绪" : "Ready") : (isZh ? "缺失" : "Missing")}
            </p>
            {charterExists ? (
              <p className="mt-1 text-xs text-(--text-muted)">{isZh ? "已维护" : "Maintained"}</p>
            ) : (
              <p className="mt-1 text-xs text-(--text-muted)">{isZh ? "待建立" : "Needs setup"}</p>
            )}
          </Link>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/start-here"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开开始页面" : "Open start here"}
        </Link>
        <Link
          href="/apps/bamboo/tasks"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开任务" : "Open tasks"}
        </Link>
        <Link
          href="/apps/bamboo/project-charter"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开项目章程" : "Open project charter"}
        </Link>
        <Link
          href="/apps/bamboo/timeline"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开阶段概览" : "Open phase overview"}
        </Link>
        <Link
          href="/apps/bamboo/company-setup"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开公司设立" : "Open company setup"}
        </Link>
        <Link
          href="/apps/bamboo/inventory"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开货品" : "Open inventory"}
        </Link>
        <Link
          href="/apps/bamboo/shop"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开门店" : "Open shop"}
        </Link>
        <Link
          href="/apps/bamboo/eshop"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开网店" : "Open eshop"}
        </Link>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "通用分类" : "General categories"}
          </h2>
          <ul className="mt-4 space-y-2">
            {generalTiles.map((tile) => (
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
            {isZh ? "货品" : "Inventory"}
          </h2>
          <ul className="mt-4 space-y-2">
            {inventoryTiles.map((tile) => (
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
            {isZh ? "公司设立" : "Setup company"}
          </h2>
          <ul className="mt-4 space-y-2">
            {setupCompanyTiles.map((tile) => (
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
            {isZh ? "门店" : "Shop"}
          </h2>
          <ul className="mt-4 space-y-2">
            {shopTiles.map((tile) => (
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
            {isZh ? "网店" : "Eshop"}
          </h2>
          <ul className="mt-4 space-y-2">
            {eshopTiles.map((tile) => (
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
            {isZh ? "文档" : "Documents"}
          </h2>
          <ul className="mt-4 space-y-2">
            {documentTiles.map((tile) => (
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
          {isZh ? "打开财务设置" : "Open finance setup"}
        </Link>
        <Link
          href="/apps/bamboo/company-setup/finance-requirements"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开公司设立财务要求" : "Open company setup finance requirements"}
        </Link>
      </section>
    </main>
  );
}
