import { describe, it, expect, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../../test-utils";
import api from "../../api/cashFlowApi";
import { useCashFlowsStore } from "../../states/cashFlowsStore";
import AddModal from "./AddModal.vue";

vi.mock("../../api/cashFlowApi", () => ({ default: { postCashFlow: vi.fn() } }));

async function submitValid(wrapper: VueWrapper) {
  await wrapper.find("#add-label").setValue("Gaji");
  await wrapper.find("#add-nominal").setValue("1000");
  await wrapper.find("#add-description").setValue("Bulanan");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  it("tertutup tidak merender apa pun", async () => {
    const { wrapper } = await renderWithProviders(AddModal);
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("sukses: kirim payload, emit done & close", async () => {
    vi.mocked(api.postCashFlow).mockResolvedValue({ status: "success", message: "ok" });
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: true } });
    await submitValid(wrapper);
    expect(api.postCashFlow).toHaveBeenCalledWith({
      type: "inflow", source: "cash", label: "Gaji", nominal: 1000, description: "Bulanan",
    });
    expect(wrapper.emitted("done")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: dialog error, tidak ditutup", async () => {
    vi.mocked(api.postCashFlow).mockResolvedValue({ status: "fail", message: "x" });
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: true } });
    await submitValid(wrapper);
    expect((vi.mocked(Swal.fire).mock.calls[0][0] as { icon: string }).icon).toBe("error");
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("batal & status menyimpan", async () => {
    const { wrapper, pinia } = await renderWithProviders(AddModal, { props: { open: true } });
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    useCashFlowsStore(pinia).isCashFlowAdd = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button[type=submit]").text()).toBe("Menyimpan...");
  });
});
