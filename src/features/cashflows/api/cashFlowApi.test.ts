import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import api from "./cashFlowApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn().mockResolvedValue("res") }));

const payload = { type: "inflow", source: "cash", label: "Gaji", description: "d", nominal: 10 } as const;

describe("cashFlowApi", () => {
  it("getCashFlows dengan & tanpa filter", async () => {
    await api.getCashFlows({ type: "inflow", label: "Gaji" });
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows", { params: { type: "inflow", label: "Gaji" } });
    await api.getCashFlows();
    expect(fetchApi).toHaveBeenLastCalledWith("/cash-flows", { params: {} });
  });
  it("getCashFlow", async () => {
    await api.getCashFlow(5);
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/5");
  });
  it("postCashFlow & putCashFlow", async () => {
    await api.postCashFlow(payload);
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
    await api.putCashFlow(5, payload);
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/5", { method: "PUT", body: payload });
  });
  it("delete satu dan semua", async () => {
    await api.deleteCashFlow(5);
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/5", { method: "DELETE" });
    await api.deleteAllCashFlows();
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });
  it("labels", async () => {
    await api.getLabels();
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/labels");
  });
  it("statistik harian & bulanan, dengan & tanpa query", async () => {
    await api.getStatsDaily({ end_date: "2026-10-08 23:59:59", total_data: 7 });
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/stats/daily", { params: { end_date: "2026-10-08 23:59:59", total_data: 7 } });
    await api.getStatsDaily();
    expect(fetchApi).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { params: {} });
    await api.getStatsMonthly({ total_data: 6 });
    expect(fetchApi).toHaveBeenCalledWith("/cash-flows/stats/monthly", { params: { total_data: 6 } });
    await api.getStatsMonthly();
    expect(fetchApi).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { params: {} });
  });
});
