import Link from "next/link";

import { saveCapitalScenarioAction } from "./actions";
import { ScenarioControls } from "./ScenarioControls";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  formatCzkAmount,
  getBudgetTotals,
  getInventoryBudgetBreakdown,
  getRecommendedCapitalBreakdown,
  parseCzkAmount,
} from "@/lib/bamboo-budget";
import { prisma } from "@/prisma";

type BambooRecommendedCapitalPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const DEFAULT_OPERATING_MONTHS = 3;
const DEFAULT_RESERVE_PERCENT = 25;

export default async function BambooRecommendedCapitalPage({
  searchParams,
}: BambooRecommendedCapitalPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const { saved, error } = await searchParams;

  const [budgetItems, inventoryBudget, capitalScenario] = await Promise.all([
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
    prisma.bambooCapitalScenario.findUnique({
      where: { id: "default" },
      select: {
        operatingMonths: true,
        reservePercent: true,
      },
    }),
  ]);
  const operatingMonths = capitalScenario?.operatingMonths ?? DEFAULT_OPERATING_MONTHS;
  const reservePercent = capitalScenario?.reservePercent ?? DEFAULT_RESERVE_PERCENT;
  const reserveRatio = reservePercent / 100;
  const totals = getBudgetTotals(budgetItems);
  const inventoryBudgetTotals = getInventoryBudgetBreakdown(inventoryBudget);
  const nonZeroMonthlyShopLines = budgetItems
    .map((item) => ({
      ...item,
      parsedMonthly: parseCzkAmount(item.monthlyCost),
    }))
    .filter((item) => item.parsedMonthly > 0);
  const breakdown = getRecommendedCapitalBreakdown(
    totals.oneTime + inventoryBudgetTotals.initialTotal,
    totals.monthly,
    inventoryBudgetTotals.periodicalTotal,
    operatingMonths,
    reserveRatio,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "scenario" ? <Toast message={isZh ? "资金情景已更新。" : "Capital scenario updated."} /> : null}
      {error === "invalid" ? <Toast message={isZh ? "情景参数无效。" : "Invalid scenario values."} tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "建议启动资金" : "Recommended capital" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "建议启动资金" : "Recommended capital"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "基于设立成本 + 运营成本 + 预留缓冲的资金估算。已保存的月份和预留比例会复用。"
            : "Capital estimate based on setup cost + operating costs + reserve. Saved months and reserve settings are reused."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Link
          href="/apps/bamboo/shop/budget"
          className="group block rounded-2xl border border-(--line) bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
        >
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            {isZh ? "预计设立成本" : "Estimated setup cost"}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(breakdown.setupMin)} - {formatCzkAmount(breakdown.setupMax)}
          </p>
          <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
            {isZh ? "打开门店预算" : "Open shop budget"}
          </p>
        </Link>
        {canEdit ? (
          <ScenarioControls
            action={saveCapitalScenarioAction}
            operatingMonths={operatingMonths}
            reservePercent={reservePercent}
            operatingExpensesLabel={formatCzkAmount(breakdown.operatingExpenses)}
            reserveLabel={`${formatCzkAmount(breakdown.reserveMin)} - ${formatCzkAmount(breakdown.reserveMax)}`}
            locale={locale}
          />
        ) : (
          <>
            <article className="rounded-2xl border border-(--line) bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {isZh ? `${operatingMonths} 个月支出` : `${operatingMonths} months expenses`}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
                +{formatCzkAmount(breakdown.operatingExpenses)}
              </p>
            </article>
            <article className="rounded-2xl border border-(--line) bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
                {isZh ? `${reservePercent}% 预留` : `${reservePercent}% reserve`}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
                +{formatCzkAmount(breakdown.reserveMin)} - {formatCzkAmount(breakdown.reserveMax)}
              </p>
            </article>
          </>
        )}
        <article className="rounded-2xl border border-(--line) bg-[#f8fbff] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7093] uppercase">
            {isZh ? "建议启动资金" : "Recommended capital"}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(breakdown.recommendedMin)} -{" "}
            {formatCzkAmount(breakdown.recommendedMax)}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "月度支出构成" : "Monthly expense contributors"}
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          {isZh
            ? `来自 Shop Budget 的月度成本项（公式使用 ${breakdown.operatingMonths} 个月）。金额为 0 的行已隐藏。`
            : `Monthly lines from Shop Budget (${breakdown.operatingMonths} months in formula). Zero-value lines are hidden.`}
        </p>

        {nonZeroMonthlyShopLines.length > 0 ? (
          <div className="mt-4 space-y-2">
            {nonZeroMonthlyShopLines.map((item) => (
              <article
                key={item.id}
                className="grid gap-2 rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 md:grid-cols-[1fr_0.45fr_1.4fr]"
              >
                <p className="text-sm font-semibold text-[#1a2b49]">{item.category}</p>
                <p className="text-sm font-medium text-[#1a2b49]">
                  {formatCzkAmount(item.parsedMonthly)}
                </p>
                <p className="text-sm text-(--text-muted)">{item.notes || (isZh ? "无备注。" : "No notes.")}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-(--text-muted)">
            {isZh ? "没有非零的月度门店预算行。" : "No non-zero monthly shop lines."}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "计算步骤" : "Calculation steps"}
        </h2>
        <ol className="mt-4 space-y-2 text-sm text-[#314567]">
          <li>
            {isZh ? "1. 从预计设立成本区间开始：" : "1. Start from estimated setup cost range:"}
            {" "}
            {formatCzkAmount(breakdown.setupMin)} - {formatCzkAmount(breakdown.setupMax)}
          </li>
          <li>
            {isZh ? `2. 加上 ${breakdown.operatingMonths} 个月支出：` : `2. Add ${breakdown.operatingMonths} months expenses:`}
            {" "}
            +{formatCzkAmount(breakdown.operatingExpenses)}
          </li>
          <li>
            {isZh
              ? `2a. 其中包含周期性货品预算（按 ${breakdown.operatingMonths} 个月折算）：`
              : `2a. This includes periodical inventory estimate (scaled for ${breakdown.operatingMonths} months):`}
            {" "}
            +{formatCzkAmount(breakdown.periodicalInventoryScaled)}
          </li>
          <li>
            {isZh
              ? `3. 加上预留缓冲（${Math.round(breakdown.reserveRatio * 100)}%）：`
              : `3. Add reserve buffer (${Math.round(breakdown.reserveRatio * 100)}%):`}
            {" "}
            +{formatCzkAmount(breakdown.reserveMin)} - {formatCzkAmount(breakdown.reserveMax)}
          </li>
          <li className="font-semibold text-[#1a2b49]">
            {isZh ? "4. 最终建议启动资金：" : "4. Final recommended capital:"}
            {" "}
            {formatCzkAmount(breakdown.recommendedMin)} - {formatCzkAmount(breakdown.recommendedMax)}
          </li>
        </ol>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/apps/bamboo/estimated-setup-cost"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开预计设立成本详情" : "Open estimated setup cost details"}
        </Link>
        <Link
          href="/apps/bamboo/inventory/budget"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开货品预算" : "Open inventory budget"}
        </Link>
        <Link
          href="/apps/bamboo/shop/budget"
          className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
        >
          {isZh ? "打开门店预算" : "Open shop budget"}
        </Link>
      </section>
    </main>
  );
}
