import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import { putAccessToken } from "../../../helpers/apiHelper";
import NavbarComponent from "./NavbarComponent.vue";

const profile = { id: 1, name: "Budi", email: "budi@x.id", photo: "p.png", created_at: "" };

describe("NavbarComponent", () => {
  it("tanpa profil & tanpa sesi: tidak ada identitas dan status", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Sesi aktif");
  });

  it("menampilkan nama, email, status sesi & emit toggle sidebar", async () => {
    putAccessToken("t");
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    useUsersStore(pinia).profile = profile;
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("budi@x.id");
    expect(wrapper.text()).toContain("Sesi aktif");
    await wrapper.find("[aria-label='Buka menu']").trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("logout dikonfirmasi -> token dihapus & ke halaman login", async () => {
    putAccessToken("t");
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent);
    await wrapper.find("[aria-label='Keluar']").trigger("click");
    await flushPromises();
    expect(useAuthStore(pinia).token).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("logout dibatalkan", async () => {
    putAccessToken("t");
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    await wrapper.find("[aria-label='Keluar']").trigger("click");
    await flushPromises();
    expect(useAuthStore(pinia).token).toBe("t");
  });
});
