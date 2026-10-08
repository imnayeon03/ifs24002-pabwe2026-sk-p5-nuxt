import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../../test-utils";
import api from "../../api/cashFlowApi";
import { useCashFlowsStore } from "../../states/cashFlowsStore";
import ChangeModal from "./ChangeModal.vue";

vi.mock("../../api/cashFlowApi", () => ({ default: { putCashFlow: vi.fn() } }));

const cashFlow = {
  id: 7, user_id: 1, type: "outflow", source: "savings", label: "Belanja",
  description: "Beli", nominal: 5000, created_at: "", updated_at: "",
} as const;

const input = (w: { find: (s: string) => { element: Element } }, sel: string) =>
  (w.find(sel).element as HTMLInputElement).value;

describe("ChangeModal", () => {
  it("tertutup atau tanpa data tidak merender", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { open: false, cashFlow } });
    expect(wrapper.find("form").exists()).toBe(false);
    await wrapper.setProps({ open: true, cashFlow: null });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("form terisi dari data transaksi", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { open: true, cashFlow } });
    expect(input(wrapper, "#chg-label")).toBe("Belanja");
    expect(input(wrapper, "#chg-nominal")).toBe("5000");
    expect(input(wrapper, "#chg-source")).toBe("savings");
  });

  it("sukses & gagal", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { open: true, cashFlow } });
    vi.mocked(api.putCashFlow).mockResolvedValue({ status: "success", message: "ok" });
    await wrapper.find("#chg-label").setValue("Baru");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.putCashFlow).toHaveBeenCalledWith(7, {
      type: "outflow", source: "savings", label: "Baru", nominal: 5000, description: "Beli",
    });
    expect(wrapper.emitted("done")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);

    vi.mocked(api.putCashFlow).mockResolvedValue({ status: "fail", message: "x" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect((vi.mocked(Swal.fire).mock.calls.at(-1)![0] as { icon: string }).icon).toBe("error");
  });

  it("batal & status menyimpan", async () => {
    const { wrapper, pinia } = await renderWithProviders(ChangeModal, { props: { open: true, cashFlow } });
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    useCashFlowsStore(pinia).isCashFlowChange = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button[type=submit]").text()).toBe("Menyimpan...");
  });
});
