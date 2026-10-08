import { describe, it, expect, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import { useAuthStore } from "../states/authStore";
import LoginPage from "./LoginPage.vue";

vi.mock("../api/authApi", () => ({ default: { postLogin: vi.fn(), postRegister: vi.fn() } }));

async function fill(wrapper: VueWrapper, email: string, password: string) {
  await wrapper.find("#login-email-input").setValue(email);
  await wrapper.find("#login-password-input").setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

const lastIcon = () => (vi.mocked(Swal.fire).mock.calls[0][0] as { icon: string }).icon;

describe("LoginPage", () => {
  it("validasi: kosong", async () => {
    const { wrapper } = await renderWithProviders(LoginPage);
    await fill(wrapper, "", "");
    expect(wrapper.text()).toContain("Email wajib diisi");
    expect(wrapper.text()).toContain("Kata sandi wajib diisi");
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("validasi: format email", async () => {
    const { wrapper } = await renderWithProviders(LoginPage);
    await fill(wrapper, "salah", "x");
    expect(wrapper.text()).toContain("Format email tidak valid");
  });

  it("login sukses -> dialog & redirect", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ status: "success", message: "Berhasil login", data: { token: "T" } });
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fill(wrapper, "a@b.co", "rahasia");
    expect(lastIcon()).toBe("success");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("login gagal -> dialog error", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ status: "fail", message: "Salah" });
    const { wrapper } = await renderWithProviders(LoginPage);
    await fill(wrapper, "a@b.co", "rahasia");
    expect(lastIcon()).toBe("error");
  });

  it("tombol menampilkan status memproses", async () => {
    const { wrapper, pinia } = await renderWithProviders(LoginPage);
    useAuthStore(pinia).isAuthLogin = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#login-submit-button").text()).toBe("Memproses...");
  });
});
