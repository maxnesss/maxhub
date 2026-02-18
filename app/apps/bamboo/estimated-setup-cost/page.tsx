import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  formatCzkAmount,
  getBudgetTotals,
  getEstimatedSetupCostRange,
  getInventoryBudgetBreakdown,
  parseCzkAmount,
} from "@/lib/bamboo-budget";
import { prisma } from "@/prisma";

export default async function BambooEstimatedSetupCostPage() {
  await requireAppRead("BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";

  const [budgetItems, inventoryBudget] = await Promise.all([
    prisma.bambooShopBudgetItem.findMany({
      orderBy: [{ createdAt: "asc" }, { category: "asc" }],
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
  ]);
  const totals = getBudgetTotals(budgetItems);
  const inventoryBudgetTotals = getInventoryBudgetBreakdown(inventoryBudget);
  const nonZeroShopOneTimeLines = budgetItems
    .map((item) => ({
      ...item,
      parsedOneTime: parseCzkAmount(item.oneTimeCost),
    }))
    .filter((item) => item.parsedOneTime > 0);
  const nonZeroInventoryInitialLines = inventoryBudgetTotals.initialLines.filter(
    (line) => line.amount > 0,
  );
  const totalOneTimeContributors = totals.oneTime + inventoryBudgetTotals.initialTotal;
  const currentSetupRange = getEstimatedSetupCostRange(totalOneTimeContributors);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "预计设立成本" : "Estimated setup cost" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "预计设立成本" : "Estimated setup cost"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "基于基础成本与一次性预算项的设立成本视图。"
            : "Setup cost view based on baseline costs and one-time budget lines."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            {isZh ? "一次性预算总额" : "One-time budget total"}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
            +{formatCzkAmount(totalOneTimeContributors)}
          </p>
          <p className="mt-1 text-xs text-[#5f7093]">
            {isZh ? "门店一次性成本 + 首批货品成本估算。" : "Shop one-time costs + initial inventory estimate."}
          </p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-[#f8fbff] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7093] uppercase">
            {isZh ? "当前预计设立成本" : "Current estimated setup cost"}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(currentSetupRange.min)} - {formatCzkAmount(currentSetupRange.max)}
          </p>
          <p className="mt-1 text-xs text-[#5f7093]">
            {isZh ? "公式：基础设立成本 + 一次性总额" : "Formula: base setup cost + one-time total"}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "一次性成本构成" : "One-time contributors"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh ? "金额为 0 的行会被隐藏。" : "Zero-value lines are hidden."}
        </p>

        <div className="mt-4 space-y-6">
          <article>
            <h3 className="text-lg font-semibold text-[#1a2b49]">
              {isZh ? "门店预算（一次性）" : "Shop budget (one-time)"}
            </h3>
            {nonZeroShopOneTimeLines.length > 0 ? (
              <div className="mt-2 space-y-2">
                {nonZeroShopOneTimeLines.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-2 rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 md:grid-cols-[1fr_0.45fr_1.4fr]"
                  >
                    <p className="text-sm font-semibold text-[#1a2b49]">{item.category}</p>
                    <p className="text-sm font-medium text-[#1a2b49]">
                      {formatCzkAmount(item.parsedOneTime)}
                    </p>
                    <p className="text-sm text-(--text-muted)">{item.notes || (isZh ? "无备注。" : "No notes.")}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-(--text-muted)">
                {isZh ? "没有非零的一次性门店预算行。" : "No non-zero one-time shop lines."}
              </p>
            )}
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#1a2b49]">
              {isZh ? "货品预算（初始）" : "Inventory budget (initial)"}
            </h3>
            {nonZeroInventoryInitialLines.length > 0 ? (
              <div className="mt-2 space-y-2">
                {nonZeroInventoryInitialLines.map((line) => (
                  <article
                    key={line.key}
                    className="grid gap-2 rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 md:grid-cols-[1fr_0.45fr]"
                  >
                    <p className="text-sm font-semibold text-[#1a2b49]">{line.label}</p>
                    <p className="text-sm font-medium text-[#1a2b49]">
                      {formatCzkAmount(line.amount)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-(--text-muted)">
                {isZh ? "没有非零的初始货品预算行。" : "No non-zero initial inventory lines."}
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/shop/budget"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开门店预算" : "Open shop budget"}
        </Link>
        <Link
          href="/apps/bamboo/inventory/budget"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开货品预算" : "Open inventory budget"}
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
