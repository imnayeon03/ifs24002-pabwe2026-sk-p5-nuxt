import { defineStore } from "pinia";
import cashFlowApi, {
  type CashFlow,
  type CashFlowPayload,
  type CashFlowQueryParams,
  type CashFlowStats,
  type PeriodStats,
  type StatsQueryParams,
} from "../api/cashFlowApi";
import { isApiSuccess, type ApiResponse } from "../../../helpers/apiHelper";
import type { ActionResult } from "../../auth/states/authStore";

export type { CashFlow, CashFlowStats, CashFlowQueryParams };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats | null;
  labels: string[];
  statsDaily: PeriodStats | null;
  statsMonthly: PeriodStats | null;
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

type LoadingKey =
  | "isCashFlowAdd"
  | "isCashFlowChange"
  | "isCashFlowDelete"
  | "isCashFlowDeleteAll";
type DoneKey =
  | "isCashFlowAdded"
  | "isCashFlowChanged"
  | "isCashFlowDeleted"
  | "isCashFlowDeletedAll";

const toResult = (res: ApiResponse): ActionResult => ({
  success: isApiSuccess(res),
  message: res.message,
});

// Pola aksi mutasi: nyalakan loading, panggil API, simpan hasil ke flag "done".
async function mutate(
  store: CashFlowsState,
  loadingKey: LoadingKey,
  doneKey: DoneKey,
  call: () => Promise<ApiResponse>
): Promise<ActionResult> {
  store[loadingKey] = true;
  store[doneKey] = false;
  const res = await call();
  store[loadingKey] = false;
  store[doneKey] = isApiSuccess(res);
  return toResult(res);
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: null,
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),

  actions: {
    async fetchCashFlows(query: CashFlowQueryParams = {}): Promise<ActionResult> {
      this.isCashFlow = true;
      const res = await cashFlowApi.getCashFlows(query);
      this.isCashFlow = false;
      if (isApiSuccess(res) && res.data) {
        this.cashFlows = res.data.cash_flows;
        this.stats = res.data.stats;
      }
      return toResult(res);
    },

    async fetchCashFlow(id: number | string): Promise<ActionResult> {
      this.isCashFlow = true;
      const res = await cashFlowApi.getCashFlow(id);
      this.isCashFlow = false;
      if (isApiSuccess(res) && res.data) {
        this.cashFlow = res.data.cash_flow;
      }
      return toResult(res);
    },

    async fetchLabels(): Promise<ActionResult> {
      const res = await cashFlowApi.getLabels();
      if (isApiSuccess(res) && res.data) {
        this.labels = res.data.labels;
      }
      return toResult(res);
    },

    async fetchStatsDaily(query: StatsQueryParams = {}): Promise<ActionResult> {
      const res = await cashFlowApi.getStatsDaily(query);
      if (isApiSuccess(res) && res.data) {
        this.statsDaily = res.data;
      }
      return toResult(res);
    },

    async fetchStatsMonthly(query: StatsQueryParams = {}): Promise<ActionResult> {
      const res = await cashFlowApi.getStatsMonthly(query);
      if (isApiSuccess(res) && res.data) {
        this.statsMonthly = res.data;
      }
      return toResult(res);
    },

    addCashFlow(payload: CashFlowPayload): Promise<ActionResult> {
      return mutate(this, "isCashFlowAdd", "isCashFlowAdded", () =>
        cashFlowApi.postCashFlow(payload)
      );
    },

    changeCashFlow(id: number | string, payload: CashFlowPayload): Promise<ActionResult> {
      return mutate(this, "isCashFlowChange", "isCashFlowChanged", () =>
        cashFlowApi.putCashFlow(id, payload)
      );
    },

    deleteCashFlow(id: number | string): Promise<ActionResult> {
      return mutate(this, "isCashFlowDelete", "isCashFlowDeleted", () =>
        cashFlowApi.deleteCashFlow(id)
      );
    },

    deleteAllCashFlows(): Promise<ActionResult> {
      return mutate(this, "isCashFlowDeleteAll", "isCashFlowDeletedAll", () =>
        cashFlowApi.deleteAllCashFlows()
      );
    },
  },
});
