import { fetchApi } from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

/** Ringkasan saldo dari API. Ada juga kunci dinamis seperti total_inflow_label_gaji. */
export interface CashFlowStats {
  cashflow?: number;
  total_inflow?: number;
  total_outflow?: number;
  [key: string]: number | undefined;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface StatsQueryParams {
  end_date?: string;
  total_data?: number;
}

export type StatsSeries = Record<string, number>;

export interface PeriodStats {
  stats_inflow: StatsSeries;
  stats_outflow: StatsSeries;
  stats_cashflow: StatsSeries;
}

const cashFlowApi = {
  getCashFlows: (query: CashFlowQueryParams = {}) =>
    fetchApi<{ cash_flows: CashFlow[]; stats: CashFlowStats }>("/cash-flows", {
      params: { ...query },
    }),

  getCashFlow: (id: number | string) =>
    fetchApi<{ cash_flow: CashFlow }>(`/cash-flows/${id}`),

  postCashFlow: (payload: CashFlowPayload) =>
    fetchApi<{ cash_flow_id: number }>("/cash-flows", { method: "POST", body: payload }),

  putCashFlow: (id: number | string, payload: CashFlowPayload) =>
    fetchApi(`/cash-flows/${id}`, { method: "PUT", body: payload }),

  deleteCashFlow: (id: number | string) =>
    fetchApi(`/cash-flows/${id}`, { method: "DELETE" }),

  getLabels: () => fetchApi<{ labels: string[] }>("/cash-flows/labels"),

  getStatsDaily: (query: StatsQueryParams = {}) =>
    fetchApi<PeriodStats>("/cash-flows/stats/daily", { params: { ...query } }),

  getStatsMonthly: (query: StatsQueryParams = {}) =>
    fetchApi<PeriodStats>("/cash-flows/stats/monthly", { params: { ...query } }),

  deleteAllCashFlows: () => fetchApi("/cash-flows", { method: "DELETE" }),
};

export default cashFlowApi;
