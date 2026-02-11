import type { BambooShopBudgetItem } from "@prisma/client";

const BASE_SETUP_COST_MIN_CZK = 10_000;
const BASE_SETUP_COST_MAX_CZK = 15_000;

export function parseCzkAmount(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCzkAmount(amount: number) {
  return `${new Intl.NumberFormat("cs-CZ").format(amount)} CZK`;
}

export function getBudgetTotals(items: Pick<BambooShopBudgetItem, "monthlyCost" | "oneTimeCost">[]) {
  return items.reduce(
    (totals, item) => {
      totals.monthly += parseCzkAmount(item.monthlyCost);
      totals.oneTime += parseCzkAmount(item.oneTimeCost);
      return totals;
    },
    { monthly: 0, oneTime: 0 },
  );
}

export function getEstimatedSetupCostLabel(extraOneTimeCostCzk: number) {
  const min = BASE_SETUP_COST_MIN_CZK + extraOneTimeCostCzk;
  const max = BASE_SETUP_COST_MAX_CZK + extraOneTimeCostCzk;
  return `${formatCzkAmount(min)} - ${formatCzkAmount(max)}`;
}
