import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import api from "../api/cashFlowApi";
import DetailPage from "./DetailPage.vue";

vi.mock("../api/cashFlowApi", () => ({
  default: { getCashFlow: vi.fn(), deleteCashFlow: vi.fn(), putCashFlow: vi.fn() },
}));

const ok = (data?: unknown) => ({ status: "success", message: "ok", data }) as never;
const fail = { status: "fail", message: "gagal" } as never;
const base = {
  id: 4, user_id: 1, type: "inflow", source: "loans", label: "Pinjaman Teman", description: "Untuk modal",
  nominal: 750000, created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-02T00:00:00Z",
};
const route = "/cash-flows/4";
const stub = { template: "<div />" };
const routes = [
  { path: "/cash-flows/:cashFlowId", component: stub },
  { path: "/", component: stub },
];

async function mountPage(cashFlow = base) {
  vi.mocked(api.getCashFlow).mockResolvedValue(ok({ cash_flow: cashFlow }));
  const r = await renderWithProviders(DetailPage, { route, routes });
  await flushPromises();
  return r;
}
const btn = (w: Awaited<ReturnType<typeof mountPage>>["wrapper"], text: string) =>
  w.findAll("button").find((b) => b.text() === text)!;

describe("DetailPage", () => {
  it("menampilkan rincian lengkap transaksi", async () => {
    const { wrapper } = await mountPage();
    expect(api.getCashFlow).toHaveBeenCalledWith("4");
    const text = wrapper.text().replace(/\s/g, " ");
    expect(text).toContain("Pinjaman Teman");
    expect(text).toContain("Pemasukan");
    expect(text).toContain("Pinjaman");
    expect(text).toContain("Rp 750.000");
    expect(text).toContain("Untuk modal");
    expect(wrapper.find("span").classes()).toContain("bg-green-100");
  });

  it("badge merah untuk pengeluaran", async () => {
    const { wrapper } = await mountPage({ ...base, type: "outflow" } as typeof base);
    expect(wrapper.find("span").classes()).toContain("bg-red-100");
  });

  it("belum termuat -> teks memuat; gagal -> dialog error", async () => {
    vi.mocked(api.getCashFlow).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(DetailPage, { route, routes });
    expect(wrapper.text()).toContain("Memuat data");

    vi.mocked(api.getCashFlow).mockResolvedValue(fail);
    await renderWithProviders(DetailPage, { route, routes });
    await flushPromises();
    expect(vi.mocked(Swal.fire).mock.calls[0][0]).toMatchObject({ icon: "error", text: "gagal" });
  });

  it("ubah: buka modal, muat ulang saat selesai, tutup", async () => {
    const { wrapper } = await mountPage();
    await btn(wrapper, "Ubah").trigger("click");
    const modal = wrapper.findComponent({ name: "ChangeModal" });
    expect(modal.props("open")).toBe(true);
    modal.vm.$emit("done");
    await flushPromises();
    expect(api.getCashFlow).toHaveBeenCalledTimes(2);
    modal.vm.$emit("close");
    await wrapper.vm.$nextTick();
    expect(modal.props("open")).toBe(false);
  });

  it("hapus: batal, gagal, sukses -> kembali ke beranda", async () => {
    const { wrapper, router } = await mountPage();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    await btn(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(api.deleteCashFlow).not.toHaveBeenCalled();

    vi.mocked(api.deleteCashFlow).mockResolvedValue(fail);
    await btn(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(route);

    vi.mocked(api.deleteCashFlow).mockResolvedValue(ok());
    await btn(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(api.deleteCashFlow).toHaveBeenCalledWith(4);
    expect(router.currentRoute.value.path).toBe("/");
  });
});
