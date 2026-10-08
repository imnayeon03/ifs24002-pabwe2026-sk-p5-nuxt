import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import api from "../api/cashFlowApi";
import { useCashFlowsStore } from "./cashFlowsStore";

vi.mock("../api/cashFlowApi", () => ({
  default: {
    getCashFlows: vi.fn(), getCashFlow: vi.fn(), postCashFlow: vi.fn(), putCashFlow: vi.fn(),
    deleteCashFlow: vi.fn(), getLabels: vi.fn(), getStatsDaily: vi.fn(), getStatsMonthly: vi.fn(),
    deleteAllCashFlows: vi.fn(),
  },
}));

const ok = (data?: unknown) => ({ status: "success", message: "ok", data }) as never;
const fail = { status: "fail", message: "gagal" } as never;
const period = { stats_inflow: { "01-10-2026": 1 }, stats_outflow: {}, stats_cashflow: {} };

describe("cashFlowsStore", () => {
  let store: ReturnType<typeof useCashFlowsStore>;
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCashFlowsStore();
  });

  it("fetchCashFlows menyimpan daftar & statistik", async () => {
    vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [{ id: 1 }], stats: { cashflow: 5 } }));
    expect((await store.fetchCashFlows({ type: "inflow" })).success).toBe(true);
    expect(api.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
    expect(store.cashFlows).toEqual([{ id: 1 }]);
    expect(store.stats).toEqual({ cashflow: 5 });
    vi.mocked(api.getCashFlows).mockResolvedValue(fail);
    await store.fetchCashFlows();
    expect(api.getCashFlows).toHaveBeenLastCalledWith({});
    expect(store.cashFlows).toEqual([{ id: 1 }]);
    vi.mocked(api.getCashFlows).mockResolvedValue(ok());
    await store.fetchCashFlows();
    expect(store.cashFlows).toEqual([{ id: 1 }]);
    expect(store.isCashFlow).toBe(false);
  });

  it("fetchCashFlow", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValue(ok({ cash_flow: { id: 9 } }));
    await store.fetchCashFlow(9);
    expect(store.cashFlow).toEqual({ id: 9 });
    vi.mocked(api.getCashFlow).mockResolvedValue(fail);
    expect((await store.fetchCashFlow(9)).success).toBe(false);
    vi.mocked(api.getCashFlow).mockResolvedValue(ok());
    await store.fetchCashFlow(9);
    expect(store.cashFlow).toEqual({ id: 9 });
  });

  it("fetchLabels", async () => {
    vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ["gaji"] }));
    await store.fetchLabels();
    expect(store.labels).toEqual(["gaji"]);
    vi.mocked(api.getLabels).mockResolvedValue(fail);
    expect((await store.fetchLabels()).success).toBe(false);
    vi.mocked(api.getLabels).mockResolvedValue(ok());
    await store.fetchLabels();
    expect(store.labels).toEqual(["gaji"]);
  });

  it("fetchStatsDaily & fetchStatsMonthly", async () => {
    vi.mocked(api.getStatsDaily).mockResolvedValue(ok(period));
    await store.fetchStatsDaily({ total_data: 7 });
    expect(api.getStatsDaily).toHaveBeenCalledWith({ total_data: 7 });
    expect(store.statsDaily).toEqual(period);
    vi.mocked(api.getStatsDaily).mockResolvedValue(fail);
    await store.fetchStatsDaily();
    expect(api.getStatsDaily).toHaveBeenLastCalledWith({});
    expect(store.statsDaily).toEqual(period);
    vi.mocked(api.getStatsDaily).mockResolvedValue(ok());
    await store.fetchStatsDaily();

    vi.mocked(api.getStatsMonthly).mockResolvedValue(ok(period));
    await store.fetchStatsMonthly({ total_data: 6 });
    expect(store.statsMonthly).toEqual(period);
    vi.mocked(api.getStatsMonthly).mockResolvedValue(fail);
    await store.fetchStatsMonthly();
    expect(api.getStatsMonthly).toHaveBeenLastCalledWith({});
    vi.mocked(api.getStatsMonthly).mockResolvedValue(ok());
    await store.fetchStatsMonthly();
    expect(store.statsMonthly).toEqual(period);
  });

  const payload = { type: "inflow", source: "cash", label: "l", description: "d", nominal: 1 } as const;
  const cases = [
    ["addCashFlow", "postCashFlow", [payload], "isCashFlowAdd", "isCashFlowAdded"],
    ["changeCashFlow", "putCashFlow", [1, payload], "isCashFlowChange", "isCashFlowChanged"],
    ["deleteCashFlow", "deleteCashFlow", [1], "isCashFlowDelete", "isCashFlowDeleted"],
    ["deleteAllCashFlows", "deleteAllCashFlows", [], "isCashFlowDeleteAll", "isCashFlowDeletedAll"],
  ] as const;

  it.each(cases)("%s mengatur flag loading & done", async (action, apiFn, args, loading, done) => {
    const apiMock = vi.mocked(api[apiFn]) as unknown as ReturnType<typeof vi.fn>;
    const run = store[action] as unknown as (...a: unknown[]) => Promise<unknown>;
    apiMock.mockResolvedValue(ok());
    const promise = run.apply(store, args as unknown[]);
    expect(store[loading]).toBe(true);
    expect(await promise).toEqual({ success: true, message: "ok" });
    expect(apiMock).toHaveBeenCalledWith(...args);
    expect(store[loading]).toBe(false);
    expect(store[done]).toBe(true);

    apiMock.mockResolvedValue(fail);
    expect(await run.apply(store, args as unknown[])).toEqual({ success: false, message: "gagal" });
    expect(store[done]).toBe(false);
  });
});
