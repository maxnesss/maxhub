import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { formatCzkAmount, getBudgetTotals, parseCzkAmount } from "@/lib/bamboo-budget";
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

export default async function BambooShopBudgetPage({
  searchParams,
}: ShopBudgetPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error, edit } = await searchParams;
  const editId = edit && edit.trim().length > 0 ? edit : null;

  const budgetItems = await prisma.bambooShopBudgetItem.findMany({
    orderBy: [{ createdAt: "asc" }, { category: "asc" }],
  });
  const budgetTotals = getBudgetTotals(budgetItems);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved ? <Toast message="Budget updated." /> : null}
      {error ? <Toast message="Invalid budget input." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: "Shop", href: "/apps/bamboo/shop" },
                { label: "Budget" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Budget
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Expanded budget planning with editable monthly and one-time cost
              lines.
            </p>
          </div>

          <Link
            href="/apps/bamboo/shop"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to shop
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Budget principles
          </h2>
          <ul className="mt-4 space-y-2">
            {BUDGET_PRINCIPLES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#314567]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Scenario planning
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#314567]">
            <li>
              Lean scenario: keep fit-out minimal and optimize cash runway first.
            </li>
            <li>
              Base scenario: balanced investment in shop look + functional back-office.
            </li>
            <li>
              Premium scenario: stronger design customization and brand experience.
            </li>
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Monthly total
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(budgetTotals.monthly)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            One-time total
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(budgetTotals.oneTime)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-[#f8fbff] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7093] uppercase">
            Estimated setup boost
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            +{formatCzkAmount(budgetTotals.oneTime)}
          </p>
          <p className="mt-1 text-xs text-[#5f7093]">Automatically reflected on Bamboo main page.</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Budget lines
        </h2>

        <div className="mt-4 hidden grid-cols-[1fr_0.7fr_0.7fr_1.6fr_auto] gap-2 rounded-lg border border-[#e3eaf7] bg-[#f7faff] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#61708e] uppercase md:grid">
          <p>Category</p>
          <p>Monthly (CZK)</p>
          <p>One-time (CZK)</p>
          <p>Notes</p>
          <p>Actions</p>
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
                    Save
                  </button>
                  <Link
                    href="/apps/bamboo/shop/budget"
                    className="inline-flex items-center justify-center rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                  >
                    Cancel
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
                        Edit
                      </Link>
                      <form action={deleteShopBudgetItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#9a4934] hover:bg-[#ffece7]"
                        >
                          Remove
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
              placeholder="Category"
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
              placeholder="Notes"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Add
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
