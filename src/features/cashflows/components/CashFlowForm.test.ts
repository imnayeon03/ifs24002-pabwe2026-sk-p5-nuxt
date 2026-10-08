import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CashFlowForm from "./CashFlowForm.vue";

const initial = { type: "outflow", source: "savings", label: "Belanja", description: "Beli", nominal: 5000 } as const;
const base = { prefix: "t", submitLabel: "Simpan" };

describe("CashFlowForm", () => {
  it("nilai awal default (inflow, tunai)", () => {
    const wrapper = mount(CashFlowForm, { props: base });
    expect((wrapper.find("#t-type").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.find("#t-source").element as HTMLSelectElement).value).toBe("cash");
    expect((wrapper.find("#t-nominal").element as HTMLInputElement).value).toBe("");
  });

  it("terisi dari data awal", () => {
    const wrapper = mount(CashFlowForm, { props: { ...base, initial } });
    expect((wrapper.find("#t-type").element as HTMLSelectElement).value).toBe("outflow");
    expect((wrapper.find("#t-label").element as HTMLInputElement).value).toBe("Belanja");
    expect((wrapper.find("#t-nominal").element as HTMLInputElement).value).toBe("5000");
  });

  it("validasi", async () => {
    const wrapper = mount(CashFlowForm, { props: base });
    await wrapper.find("form").trigger("submit");
    const t = wrapper.text();
    expect(t).toContain("Label wajib diisi");
    expect(t).toContain("Nominal harus lebih dari 0");
    expect(t).toContain("Keterangan wajib diisi");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("emit payload yang valid", async () => {
    const wrapper = mount(CashFlowForm, { props: base });
    await wrapper.find("#t-type").setValue("outflow");
    await wrapper.find("#t-source").setValue("loans");
    await wrapper.find("#t-label").setValue("Cicilan");
    await wrapper.find("#t-nominal").setValue("2500");
    await wrapper.find("#t-description").setValue("Bulan ini");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")![0]).toEqual([
      { type: "outflow", source: "loans", label: "Cicilan", nominal: 2500, description: "Bulan ini" },
    ]);
  });

  it("tombol batal & status menyimpan", async () => {
    const wrapper = mount(CashFlowForm, { props: { ...base, busy: true } });
    expect(wrapper.find("button[type=submit]").text()).toBe("Menyimpan...");
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    await wrapper.setProps({ busy: false });
    expect(wrapper.find("button[type=submit]").text()).toBe("Simpan");
  });
});
