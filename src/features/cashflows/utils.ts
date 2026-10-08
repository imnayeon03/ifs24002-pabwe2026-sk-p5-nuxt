import type { CashFlowSource, CashFlowStats, CashFlowType } from "./api/cashFlowApi";

export const TYPE_LABELS: Record<CashFlowType, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

export const SOURCE_LABELS: Record<CashFlowSource, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

/** Mengambil angka dari object stats; kunci yang tidak ada dianggap 0. */
export function statValue(stats: CashFlowStats | null, key: string): number {
  return Number(stats?.[key]) || 0;
}

/** Saldo sebuah sumber dana = total masuk - total keluar pada sumber itu. */
export function sourceBalance(stats: CashFlowStats | null, source: CashFlowSource): number {
  return statValue(stats, `total_inflow_${source}`) - statValue(stats, `total_outflow_${source}`);
}

// "2026-10-08" -> "2026-10-08 00:00:00"
export function toStartOfDay(date: string): string {
  return `${date} 00:00:00`;
}

// "2026-10-08" -> "2026-10-08 23:59:59"
export function toEndOfDay(date: string): string {
  return `${date} 23:59:59`;
}
