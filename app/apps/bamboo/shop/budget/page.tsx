import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { formatCzkAmount, getBudgetTotals, parseCzkAmount } from "@/lib/bamboo-budget";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import { prisma } from "@/prisma";

import {
  addShopBudgetItemAction,
  deleteShopBudgetItemAction,
  updateShopBudgetItemAction,
} from "./actions";

type ShopBudgetPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

const BUDGET_PRINCIPLES = [
  "Keep 10-15% contingency for unknown setup costs.",
  "Separate one-time launch costs from monthly operating costs.",
  "Review actual vs planned spend every week during setup.",
  "Avoid over-customization before product-market fit is validated.",
];

const BUDGET_PRINCIPLES_ZH = [
  "为未知启动成本预留 10-15% 预备金。",
  "将一次性启动成本和月度运营成本分开。",
  "搭建期每周复盘实际支出与预算差异。",
  "在验证产品市场匹配前，避免过度定制投入。",
];

export default async function BambooShopBudgetPage({
  searchParams,
}: ShopBudgetPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const { saved, error, edit } = await searchParams;
  const editId = edit && edit.trim().length > 0 ? edit : null;

  const budgetItems = await prisma.bambooShopBudgetItem.findMany({
    orderBy: [{ createdAt: "asc" }, { category: "asc" }],
  });
  const budgetTotals = getBudgetTotals(budgetItems);
  const budgetPrinciples = isZh ? BUDGET_PRINCIPLES_ZH : BUDGET_PRINCIPLES;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved ? <Toast message={isZh ? "预算已更新。" : "Budget updated."} /> : null}
      {error ? <Toast message={isZh ? "预算输入无效。" : "Invalid budget input."} tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: isZh ? "门店" : "Shop", href: "/apps/bamboo/shop" },
                { label: isZh ? "预算" : "Budget" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              {isZh ? "预算" : "Budget"}
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              {isZh
                ? "扩展预算规划，支持按月度和一次性成本逐项编辑。"
                : "Expanded budget planning with editable monthly and one-time cost lines."}
            </p>
          </div>

          <Link
            href="/apps/bamboo/shop"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {isZh ? "返回门店模块" : "Back to shop"}
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "预算原则" : "Budget principles"}
          </h2>
          <ul className="mt-4 space-y-2">
            {budgetPrinciples.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#314567]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "情景规划" : "Scenario planning"}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#314567]">
            <li>
              {isZh
                ? "精简场景：先控制装修投入，优先保证现金续航。"
                : "Lean scenario: keep fit-out minimal and optimize cash runway first."}
            </li>
            <li>
              {isZh
                ? "基础场景：门店形象与后台功能保持平衡投入。"
                : "Base scenario: balanced investment in shop look + functional back-office."}
            </li>
            <li>
              {isZh
                ? "高配场景：更强设计定制与品牌体验投入。"
                : "Premium scenario: stronger design customization and brand experience."}
            </li>
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            {isZh ? "月度总计" : "Monthly total"}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(budgetTotals.monthly)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            {isZh ? "一次性总计" : "One-time total"}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(budgetTotals.oneTime)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-[#f8fbff] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7093] uppercase">
            {isZh ? "预计启动增量" : "Estimated setup boost"}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            +{formatCzkAmount(budgetTotals.oneTime)}
          </p>
          <p className="mt-1 text-xs text-[#5f7093]">
            {isZh ? "会自动同步到 Bamboo 首页。" : "Automatically reflected on Bamboo main page."}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          {isZh ? "预算条目" : "Budget lines"}
        </h2>

        <div className="mt-4 hidden grid-cols-[1fr_0.7fr_0.7fr_1.6fr_auto] gap-2 rounded-lg border border-[#e3eaf7] bg-[#f7faff] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#61708e] uppercase md:grid">
          <p>{isZh ? "分类" : "Category"}</p>
          <p>{isZh ? "月度（CZK）" : "Monthly (CZK)"}</p>
          <p>{isZh ? "一次性（CZK）" : "One-time (CZK)"}</p>
          <p>{isZh ? "备注" : "Notes"}</p>
          <p>{isZh ? "操作" : "Actions"}</p>
        </div>
        <div className="mt-4 space-y-2">
          {budgetItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3">
              {canEdit && editId === item.id ? (
                <form action={updateShopBudgetItemAction} className="grid gap-2 md:grid-cols-[1fr_0.7fr_0.7fr_1.6fr_auto_auto] md:items-start">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="text"
                    name="category"
                    defaultValue={item.category}
                    required
                    maxLength={120}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    name="monthlyCostCzk"
                    defaultValue={parseCzkAmount(item.monthlyCost)}
                    required
                    min={0}
                    step={1}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    name="oneTimeCostCzk"
                    defaultValue={parseCzkAmount(item.oneTimeCost)}
                    required
                    min={0}
                    step={1}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <textarea
                    name="notes"
                    defaultValue={item.notes}
                    rows={2}
                    maxLength={1200}
                    className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    {isZh ? "保存" : "Save"}
                  </button>
                  <Link
                    href="/apps/bamboo/shop/budget"
                    className="inline-flex items-center justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    {isZh ? "取消" : "Cancel"}
                  </Link>
                </form>
              ) : (
                <div className="grid gap-2 md:grid-cols-[1fr_0.7fr_0.7fr_1.6fr_auto] md:items-start">
                  <p className="text-sm font-semibold text-[#1a2b49]">{item.category}</p>
                  <p className="text-sm text-[#1a2b49]">{formatCzkAmount(parseCzkAmount(item.monthlyCost))}</p>
                  <p className="text-sm text-[#1a2b49]">{formatCzkAmount(parseCzkAmount(item.oneTimeCost))}</p>
                  <p className="text-sm text-(--text-muted)">{item.notes}</p>
                  {canEdit ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/apps/bamboo/shop/budget?edit=${item.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        {isZh ? "编辑" : "Edit"}
                      </Link>
                      <form action={deleteShopBudgetItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                        >
                          {isZh ? "删除" : "Remove"}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>

        {canEdit ? (
          <form action={addShopBudgetItemAction} className="mt-4 grid gap-2 md:grid-cols-[1fr_0.7fr_0.7fr_1.6fr_auto] md:items-start">
            <input
              type="text"
              name="category"
              required
              maxLength={120}
              placeholder={isZh ? "分类" : "Category"}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              name="monthlyCostCzk"
              required
              min={0}
              step={1}
              placeholder="0"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              name="oneTimeCostCzk"
              required
              min={0}
              step={1}
              placeholder="0"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={2}
              maxLength={1200}
              placeholder={isZh ? "备注" : "Notes"}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              {isZh ? "添加" : "Add"}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
