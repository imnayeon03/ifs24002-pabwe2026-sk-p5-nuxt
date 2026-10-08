import { describe, it, expect } from "vitest";
import { SOURCE_LABELS, TYPE_LABELS, statValue, sourceBalance, toStartOfDay, toEndOfDay } from "./utils";

describe("utils arus kas", () => {
  it("label", () => {
    expect(TYPE_LABELS.inflow).toBe("Pemasukan");
    expect(SOURCE_LABELS.savings).toBe("Tabungan");
  });
  it("statValue: kunci hilang / stats null => 0", () => {
    expect(statValue({ cashflow: 5 }, "cashflow")).toBe(5);
    expect(statValue({ cashflow: 5 }, "tidak_ada")).toBe(0);
    expect(statValue(null, "cashflow")).toBe(0);
  });
  it("sourceBalance = masuk - keluar", () => {
    const stats = { total_inflow_cash: 1000, total_outflow_cash: 400, total_outflow_savings: 100 };
    expect(sourceBalance(stats, "cash")).toBe(600);
    expect(sourceBalance(stats, "savings")).toBe(-100);
    expect(sourceBalance(stats, "loans")).toBe(0);
    expect(sourceBalance(null, "cash")).toBe(0);
  });
  it("batas tanggal", () => {
    expect(toStartOfDay("2026-10-08")).toBe("2026-10-08 00:00:00");
    expect(toEndOfDay("2026-10-08")).toBe("2026-10-08 23:59:59");
  });
});
