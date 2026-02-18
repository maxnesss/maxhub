import Link from "next/link";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { formatCzkAmount, getInventoryBudgetBreakdown } from "@/lib/bamboo-budget";
import { prisma } from "@/prisma";

import { saveInventoryBudgetAction } from "./actions";

type BambooInventoryBudgetPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const DEFAULT_VALUES = {
  initialInventoryBuy: 0,
  initialTransportation: 0,
  initialTaxesImportFees: 0,
  initialTransportToShop: 0,
  initialLabelling: 0,
  periodicalInventoryBuy: 0,
  periodicalTransportation: 0,
  periodicalTaxesImportFees: 0,
  periodicalTransportToShop: 0,
  periodicalLabelling: 0,
};

const INITIAL_FIELDS = [
  { name: "initialInventoryBuy", label: "Inventory buy" },
  { name: "initialTransportation", label: "Transportation" },
  { name: "initialTaxesImportFees", label: "Taxes + import fees" },
  { name: "initialTransportToShop", label: "Transportation to shop" },
  { name: "initialLabelling", label: "Labelling" },
] as const;

const PERIODICAL_FIELDS = [
  { name: "periodicalInventoryBuy", label: "Inventory buy" },
  { name: "periodicalTransportation", label: "Transportation" },
  { name: "periodicalTaxesImportFees", label: "Taxes + import fees" },
  { name: "periodicalTransportToShop", label: "Transportation to shop" },
  { name: "periodicalLabelling", label: "Labelling" },
] as const;

export default async function BambooInventoryBudgetPage({
  searchParams,
}: BambooInventoryBudgetPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error } = await searchParams;

  const budget = await prisma.bambooInventoryBudget.findUnique({
    where: { id: "default" },
  });

  const values = {
    ...DEFAULT_VALUES,
    ...budget,
  };

  const breakdown = getInventoryBudgetBreakdown(values);
  const nonZeroInitialLines = breakdown.initialLines.filter((line) => line.amount > 0);
  const nonZeroPeriodicalLines = breakdown.periodicalLines.filter((line) => line.amount > 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "1" ? <Toast message="Inventory budget updated." /> : null}
      {error === "invalid" ? <Toast message="Invalid inventory budget values." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Apps", href: "/apps" },
                { label: "Bamboo", href: "/apps/bamboo" },
                { label: "Inventory", href: "/apps/bamboo/inventory" },
                { label: "Budget" },
              ]}
            />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
              Inventory budget
            </h1>
            <p className="mt-4 max-w-3xl text-(--text-muted)">
              Track inventory budget for startup stock and recurring 3-month cycles.
            </p>
          </div>

          <Link
            href="/apps/bamboo/inventory"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to inventory
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Initial inventory total
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(breakdown.initialTotal)}
          </p>
        </article>

        <article className="rounded-2xl border border-(--line) bg-[#f8fbff] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5f7093] uppercase">
            Periodical inventory total (3 months)
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {formatCzkAmount(breakdown.periodicalTotal)}
          </p>
        </article>
      </section>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Editable estimates
          </h2>
          <form action={saveInventoryBudgetAction} className="mt-4 space-y-6">
            <article>
              <h3 className="text-lg font-semibold text-[#1a2b49]">Initial inventory</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {INITIAL_FIELDS.map((field) => (
                  <label key={field.name} className="grid gap-1">
                    <span className="text-xs font-semibold tracking-[0.1em] text-[#61708e] uppercase">
                      {field.label}
                    </span>
                    <input
                      type="number"
                      name={field.name}
                      min={0}
                      step={1}
                      required
                      defaultValue={values[field.name]}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-[#1a2b49]">
                Periodical inventory (once every 3 months)
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {PERIODICAL_FIELDS.map((field) => (
                  <label key={field.name} className="grid gap-1">
                    <span className="text-xs font-semibold tracking-[0.1em] text-[#61708e] uppercase">
                      {field.label}
                    </span>
                    <input
                      type="number"
                      name={field.name}
                      min={0}
                      step={1}
                      required
                      defaultValue={values[field.name]}
                      className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            </article>

            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Save inventory budget
            </button>
          </form>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
            Current estimates
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <article>
              <h3 className="text-lg font-semibold text-[#1a2b49]">Initial inventory</h3>
              <ul className="mt-2 space-y-2">
                {nonZeroInitialLines.length > 0 ? (
                  nonZeroInitialLines.map((line) => (
                    <li
                      key={line.key}
                      className="flex items-center justify-between rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm"
                    >
                      <span>{line.label}</span>
                      <span className="font-semibold text-[#1a2b49]">{formatCzkAmount(line.amount)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--text-muted)">No non-zero lines yet.</li>
                )}
              </ul>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-[#1a2b49]">
                Periodical inventory (3 months)
              </h3>
              <ul className="mt-2 space-y-2">
                {nonZeroPeriodicalLines.length > 0 ? (
                  nonZeroPeriodicalLines.map((line) => (
                    <li
                      key={line.key}
                      className="flex items-center justify-between rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm"
                    >
                      <span>{line.label}</span>
                      <span className="font-semibold text-[#1a2b49]">{formatCzkAmount(line.amount)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-(--text-muted)">No non-zero lines yet.</li>
                )}
              </ul>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
