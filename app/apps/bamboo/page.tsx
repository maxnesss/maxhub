import Link from "next/link";

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
  BAMBOO_GENERAL_TILES,
  BAMBOO_INVENTORY_TILES,
  BAMBOO_OVERVIEW_STATS,
  BAMBOO_SHOP_TILES,
  BAMBOO_SETUP_COMPANY_TILES,
} from "@/lib/bamboo-content";
import { prisma } from "@/prisma";

const OVERVIEW_STAT_LINKS: Record<string, string> = {
  "estimated setup cost": "/apps/bamboo/estimated-setup-cost",
  "recommended capital": "/apps/bamboo/recommended-capital",
};

export default async function BambooPage() {
  await requireAppRead("BAMBOO");

  const [budgetItems, inventoryBudget] = await Promise.all([
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
  );
  const overviewStats = BAMBOO_OVERVIEW_STATS.map((stat) =>
    stat.label === "Estimated setup cost"
      ? { ...stat, value: estimatedSetupCostLabel }
      : stat.label === "Recommended capital"
        ? { ...stat, value: recommendedCapitalLabel }
        : stat,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Bamboo workspace
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Interactive business plan seeded from your company setup and naming
          documents. Navigate by category: general management and company setup.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
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

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          General categories
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BAMBOO_GENERAL_TILES.map((tile) => (
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
                Open section
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Inventory
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BAMBOO_INVENTORY_TILES.map((tile) => (
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
                Open section
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Setup company
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BAMBOO_SETUP_COMPANY_TILES.map((tile) => (
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
                Open section
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#647494] uppercase">
          Shop
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BAMBOO_SHOP_TILES.map((tile) => (
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
                Open section
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
