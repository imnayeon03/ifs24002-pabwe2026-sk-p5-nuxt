import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import api from "../api/cashFlowApi";
import HomePage from "./HomePage.vue";

vi.mock("../api/cashFlowApi", () => ({
  default: {
    getCashFlows: vi.fn(), getLabels: vi.fn(), deleteCashFlow: vi.fn(),
    deleteAllCashFlows: vi.fn(), postCashFlow: vi.fn(), putCashFlow: vi.fn(),
  },
}));

const ok = (data?: unknown) => ({ status: "success", message: "ok", data }) as never;
const fail = { status: "fail", message: "gagal" } as never;

const items = [
  { id: 1, user_id: 1, type: "inflow", source: "cash", label: "Gaji", description: "d", nominal: 3000000, created_at: "2026-10-01T00:00:00Z", updated_at: "" },
  { id: 2, user_id: 1, type: "outflow", source: "savings", label: "Belanja", description: "d", nominal: 500000, created_at: "2026-10-02T00:00:00Z", updated_at: "" },
];
const stats = {
  cashflow: 2500000, total_inflow: 3000000, total_outflow: 500000,
  total_inflow_cash: 3000000, total_outflow_savings: 500000,
};

async function mountPage() {
  vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: items, stats }));
  vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ["Gaji", "Belanja"] }));
  const r = await renderWithProviders(HomePage);
  await flushPromises();
  return r;
}
const btn = (w: Awaited<ReturnType<typeof mountPage>>["wrapper"], text: string) =>
  w.findAll("button").find((b) => b.text().includes(text))!;
const icons = () => vi.mocked(Swal.fire).mock.calls.map((c) => (c[0] as { icon: string }).icon);
const norm = (s: string) => s.replace(/\s/g, " ");

describe("HomePage", () => {
  it("menampilkan 6 kartu metrik dengan nilai dari statistik", async () => {
    const { wrapper } = await mountPage();
    const cards = wrapper.findAll("[data-testid=metric-card]");
    expect(cards).toHaveLength(6);
    expect(norm(cards[0].text())).toContain("Rp 2.500.000");
    expect(norm(cards[1].text())).toContain("Rp 3.000.000");
    expect(norm(cards[2].text())).toContain("Rp 500.000");
    expect(norm(cards[3].text())).toContain("Rp 3.000.000");
    expect(norm(cards[4].text())).toContain("-Rp 500.000");
    expect(norm(cards[5].text())).toContain("Rp 0");
  });

  it("menampilkan tabel transaksi dengan badge jenis", async () => {
    const { wrapper } = await mountPage();
    const rows = wrapper.findAll("[data-testid=cash-flow-row]");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Pemasukan");
    expect(rows[0].find("span").classes()).toContain("bg-green-100");
    expect(rows[1].find("span").classes()).toContain("bg-red-100");
    expect(rows[1].find("a").attributes("href")).toBe("/cash-flows/2");
  });

  it("kartu bernilai 0 saat belum ada data, kosong & loading", async () => {
    vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [], stats: {} }));
    vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: [] }));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Memuat data");
    await flushPromises();
    expect(wrapper.text()).toContain("Belum ada transaksi");
    expect(norm(wrapper.findAll("[data-testid=metric-card]")[0].text())).toContain("Rp 0");
  });

  it("gagal memuat -> dialog error", async () => {
    vi.mocked(api.getCashFlows).mockResolvedValue(fail);
    vi.mocked(api.getLabels).mockResolvedValue(fail);
    await renderWithProviders(HomePage);
    await flushPromises();
    expect(icons()).toEqual(["error"]);
  });

  it("filter dikirim ke API dengan batas tanggal, lalu direset", async () => {
    const { wrapper } = await mountPage();
    await wrapper.find("#f-type").setValue("inflow");
    await wrapper.find("#f-source").setValue("cash");
    await wrapper.find("#f-label").setValue("Gaji");
    await wrapper.find("#f-start").setValue("2026-10-01");
    await wrapper.find("#f-end").setValue("2026-10-08");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenLastCalledWith({
      type: "inflow", source: "cash", label: "Gaji",
      start_date: "2026-10-01 00:00:00", end_date: "2026-10-08 23:59:59",
    });

    await wrapper.findAll("button").find((b) => b.text() === "Reset")!.trigger("click");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenLastCalledWith({
      type: "", source: "", label: "", start_date: "", end_date: "",
    });
  });

  it("tambah transaksi: buka modal, selesai memuat ulang, lalu tutup", async () => {
    const { wrapper } = await mountPage();
    await btn(wrapper, "Tambah Transaksi").trigger("click");
    const modal = wrapper.findComponent({ name: "AddModal" });
    expect(modal.props("open")).toBe(true);
    modal.vm.$emit("done");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenCalledTimes(2);
    modal.vm.$emit("close");
    await wrapper.vm.$nextTick();
    expect(modal.props("open")).toBe(false);
  });

  it("ubah transaksi: modal terisi data baris, lalu tutup & muat ulang", async () => {
    const { wrapper } = await mountPage();
    await wrapper.findAll("[data-testid=cash-flow-row]")[0]
      .findAll("button").find((b) => b.text() === "Ubah")!.trigger("click");
    const modal = wrapper.findComponent({ name: "ChangeModal" });
    expect(modal.props("open")).toBe(true);
    expect((modal.props("cashFlow") as { id: number }).id).toBe(1);
    modal.vm.$emit("done");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenCalledTimes(2);
    modal.vm.$emit("close");
    await wrapper.vm.$nextTick();
    expect(modal.props("open")).toBe(false);
  });

  it("hapus transaksi: batal, sukses, gagal", async () => {
    const { wrapper } = await mountPage();
    const del = () => wrapper.findAll("[data-testid=cash-flow-row]")[0]
      .findAll("button").find((b) => b.text() === "Hapus")!;

    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    await del().trigger("click");
    await flushPromises();
    expect(api.deleteCashFlow).not.toHaveBeenCalled();

    vi.mocked(api.deleteCashFlow).mockResolvedValue(ok());
    await del().trigger("click");
    await flushPromises();
    expect(api.deleteCashFlow).toHaveBeenCalledWith(1);
    expect(api.getCashFlows).toHaveBeenCalledTimes(2);

    vi.mocked(api.deleteCashFlow).mockResolvedValue(fail);
    await del().trigger("click");
    await flushPromises();
    expect(icons().at(-1)).toBe("error");
  });

  it("reset semua: batal, sukses, gagal", async () => {
    const { wrapper } = await mountPage();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    await btn(wrapper, "Reset Transaksi").trigger("click");
    await flushPromises();
    expect(api.deleteAllCashFlows).not.toHaveBeenCalled();

    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(ok());
    await btn(wrapper, "Reset Transaksi").trigger("click");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenCalledTimes(2);

    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(fail);
    await btn(wrapper, "Reset Transaksi").trigger("click");
    await flushPromises();
    expect(icons().at(-1)).toBe("error");
  });
});
