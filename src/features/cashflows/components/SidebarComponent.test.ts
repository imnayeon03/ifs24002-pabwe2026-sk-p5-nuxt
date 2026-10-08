import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

describe("SidebarComponent", () => {
  it("menampilkan 3 menu", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    ["Ringkasan Arus Kas", "Direktori Pengguna", "Profil Saya"].forEach((m) =>
      expect(wrapper.text()).toContain(m)
    );
    expect(wrapper.find("[data-testid=sidebar-backdrop]").exists()).toBe(false);
    expect(wrapper.find("aside").classes()).toContain("-translate-x-full");
  });

  it("drawer terbuka: backdrop & klik menutup", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");
    await wrapper.find("[data-testid=sidebar-backdrop]").trigger("click");
    await wrapper.find("a").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
