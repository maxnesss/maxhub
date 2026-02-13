import { describe, expect, it } from "vitest";

import {
  getBudgetTotals,
  getEstimatedSetupCostRange,
  getInventoryBudgetBreakdown,
  getRecommendedCapitalBreakdown,
  getRecommendedCapitalLabel,
  parseCzkAmount,
} from "@/lib/bamboo-budget";

describe("lib/bamboo-budget", () => {
  it("parses CZK amounts from formatted strings", () => {
    expect(parseCzkAmount("12 345 CZK")).toBe(12345);
    expect(parseCzkAmount("CZK 9,999")).toBe(9999);
    expect(parseCzkAmount("")).toBe(0);
    expect(parseCzkAmount("abc")).toBe(0);
  });

  it("computes monthly and one-time totals from budget items", () => {
    const totals = getBudgetTotals([
      { monthlyCost: "1 000 CZK", oneTimeCost: "2 500 CZK" },
      { monthlyCost: "", oneTimeCost: "2 000 CZK" },
      { monthlyCost: "750", oneTimeCost: "" },
    ]);

    expect(totals).toEqual({ monthly: 1750, oneTime: 4500 });
  });

  it("returns setup cost range with extra one-time costs included", () => {
    expect(getEstimatedSetupCostRange(5000)).toEqual({
      min: 15000,
      max: 20000,
    });
  });

  it("calculates recommended capital breakdown with default months and reserve", () => {
    const breakdown = getRecommendedCapitalBreakdown(5000, 10000, 9000);

    expect(breakdown).toMatchObject({
      setupMin: 15000,
      setupMax: 20000,
      monthlyExpense: 10000,
      periodicalInventoryEveryThreeMonths: 9000,
      periodicalInventoryScaled: 9000,
      operatingMonths: 3,
      operatingExpenses: 39000,
      threeMonthsExpenses: 39000,
      reserveRatio: 0.25,
      reserveMin: 13500,
      reserveMax: 14750,
      recommendedMin: 67500,
      recommendedMax: 73750,
    });
  });

  it("supports custom operating months and reserve ratio with rounded periodic inventory", () => {
    const breakdown = getRecommendedCapitalBreakdown(0, 10000, 5000, 4, 0.1);

    expect(breakdown.periodicalInventoryScaled).toBe(6667);
    expect(breakdown.operatingExpenses).toBe(46667);
    expect(breakdown.recommendedMin).toBe(62334);
    expect(breakdown.recommendedMax).toBe(67834);
  });

  it("returns a human-readable capital range label", () => {
    const label = getRecommendedCapitalLabel(5000, 10000, 9000);

    expect(label).toContain("CZK");
    expect(label).toContain(" - ");
  });

  it("builds inventory budget breakdown and treats non-finite values as zero", () => {
    const breakdown = getInventoryBudgetBreakdown({
      initialInventoryBuy: 1000,
      initialTransportation: 500,
      initialTaxesImportFees: 300,
      initialTransportToShop: Number.NaN,
      initialLabelling: 200,
      periodicalInventoryBuy: 700,
      periodicalTransportation: 350,
      periodicalTaxesImportFees: 200,
      periodicalTransportToShop: 150,
      periodicalLabelling: Number.NaN,
    });

    expect(breakdown.initialTotal).toBe(2000);
    expect(breakdown.periodicalTotal).toBe(1400);
    expect(breakdown.initialLines).toHaveLength(5);
    expect(breakdown.periodicalLines).toHaveLength(5);
  });

  it("returns zeroed line items when budget is null", () => {
    const breakdown = getInventoryBudgetBreakdown(null);

    expect(breakdown.initialTotal).toBe(0);
    expect(breakdown.periodicalTotal).toBe(0);
    expect(breakdown.initialLines.every((line) => line.amount === 0)).toBe(true);
    expect(breakdown.periodicalLines.every((line) => line.amount === 0)).toBe(true);
  });
});
