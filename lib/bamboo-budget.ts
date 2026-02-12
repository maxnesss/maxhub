import type { BambooInventoryBudget, BambooShopBudgetItem } from "@prisma/client";

const BASE_SETUP_COST_MIN_CZK = 10_000;
const BASE_SETUP_COST_MAX_CZK = 15_000;
const CAPITAL_OPERATING_MONTHS = 3;
const CAPITAL_BUFFER_RATIO = 0.25;

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

export function getEstimatedSetupCostRange(extraOneTimeCostCzk: number) {
  return {
    min: BASE_SETUP_COST_MIN_CZK + extraOneTimeCostCzk,
    max: BASE_SETUP_COST_MAX_CZK + extraOneTimeCostCzk,
  };
}

export function getEstimatedSetupCostLabel(extraOneTimeCostCzk: number) {
  const { min, max } = getEstimatedSetupCostRange(extraOneTimeCostCzk);
  return `${formatCzkAmount(min)} - ${formatCzkAmount(max)}`;
}

export function getRecommendedCapitalLabel(
  extraOneTimeCostCzk: number,
  monthlyExpenseCzk: number,
  periodicalInventoryEveryThreeMonthsCzk = 0,
) {
  const { recommendedMin, recommendedMax } = getRecommendedCapitalBreakdown(
    extraOneTimeCostCzk,
    monthlyExpenseCzk,
    periodicalInventoryEveryThreeMonthsCzk,
  );

  return `${formatCzkAmount(recommendedMin)} - ${formatCzkAmount(recommendedMax)}`;
}

export function getRecommendedCapitalBreakdown(
  extraOneTimeCostCzk: number,
  monthlyExpenseCzk: number,
  periodicalInventoryEveryThreeMonthsCzk = 0,
) {
  const { min: setupMin, max: setupMax } = getEstimatedSetupCostRange(extraOneTimeCostCzk);
  const threeMonthsExpenses =
    monthlyExpenseCzk * CAPITAL_OPERATING_MONTHS + periodicalInventoryEveryThreeMonthsCzk;
  const subtotalMin = setupMin + threeMonthsExpenses;
  const subtotalMax = setupMax + threeMonthsExpenses;
  const reserveMin = Math.round(subtotalMin * CAPITAL_BUFFER_RATIO);
  const reserveMax = Math.round(subtotalMax * CAPITAL_BUFFER_RATIO);
  const recommendedMin = subtotalMin + reserveMin;
  const recommendedMax = subtotalMax + reserveMax;

  return {
    setupMin,
    setupMax,
    monthlyExpense: monthlyExpenseCzk,
    periodicalInventoryEveryThreeMonths: periodicalInventoryEveryThreeMonthsCzk,
    operatingMonths: CAPITAL_OPERATING_MONTHS,
    threeMonthsExpenses,
    reserveRatio: CAPITAL_BUFFER_RATIO,
    reserveMin,
    reserveMax,
    recommendedMin,
    recommendedMax,
  };
}

type InventoryBudgetProjection = Pick<
  BambooInventoryBudget,
  | "initialInventoryBuy"
  | "initialTransportation"
  | "initialTaxesImportFees"
  | "initialTransportToShop"
  | "initialLabelling"
  | "periodicalInventoryBuy"
  | "periodicalTransportation"
  | "periodicalTaxesImportFees"
  | "periodicalTransportToShop"
  | "periodicalLabelling"
>;

export type InventoryBudgetLine = {
  key: string;
  label: string;
  amount: number;
};

function withAmount(amount: number | undefined) {
  return Number.isFinite(amount) ? Number(amount) : 0;
}

export function getInventoryBudgetBreakdown(budget: InventoryBudgetProjection | null) {
  const initialLines: InventoryBudgetLine[] = [
    { key: "initialInventoryBuy", label: "Inventory buy", amount: withAmount(budget?.initialInventoryBuy) },
    { key: "initialTransportation", label: "Transportation", amount: withAmount(budget?.initialTransportation) },
    {
      key: "initialTaxesImportFees",
      label: "Taxes + import fees",
      amount: withAmount(budget?.initialTaxesImportFees),
    },
    {
      key: "initialTransportToShop",
      label: "Transportation to shop",
      amount: withAmount(budget?.initialTransportToShop),
    },
    { key: "initialLabelling", label: "Labelling", amount: withAmount(budget?.initialLabelling) },
  ];

  const periodicalLines: InventoryBudgetLine[] = [
    {
      key: "periodicalInventoryBuy",
      label: "Inventory buy",
      amount: withAmount(budget?.periodicalInventoryBuy),
    },
    {
      key: "periodicalTransportation",
      label: "Transportation",
      amount: withAmount(budget?.periodicalTransportation),
    },
    {
      key: "periodicalTaxesImportFees",
      label: "Taxes + import fees",
      amount: withAmount(budget?.periodicalTaxesImportFees),
    },
    {
      key: "periodicalTransportToShop",
      label: "Transportation to shop",
      amount: withAmount(budget?.periodicalTransportToShop),
    },
    {
      key: "periodicalLabelling",
      label: "Labelling",
      amount: withAmount(budget?.periodicalLabelling),
    },
  ];

  return {
    initialLines,
    periodicalLines,
    initialTotal: initialLines.reduce((sum, line) => sum + line.amount, 0),
    periodicalTotal: periodicalLines.reduce((sum, line) => sum + line.amount, 0),
  };
}
