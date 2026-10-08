import { describe, it, expect, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import { useAuthStore } from "../states/authStore";
import RegisterPage from "./RegisterPage.vue";

vi.mock("../api/authApi", () => ({ default: { postLogin: vi.fn(), postRegister: vi.fn() } }));

async function fill(wrapper: VueWrapper, v: Record<"name" | "email" | "password" | "confirm", string>) {
  await wrapper.find("#name").setValue(v.name);
  await wrapper.find("#email").setValue(v.email);
  await wrapper.find("#password").setValue(v.password);
  await wrapper.find("#confirmPassword").setValue(v.confirm);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

const lastIcon = () => (vi.mocked(Swal.fire).mock.calls[0][0] as { icon: string }).icon;

describe("RegisterPage", () => {
  it("validasi: semua kosong", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage);
    await fill(wrapper, { name: "", email: "", password: "", confirm: "" });
    const t = wrapper.text();
    expect(t).toContain("Nama wajib diisi");
    expect(t).toContain("Email wajib diisi");
    expect(t).toContain("Kata sandi wajib diisi");
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("validasi: email salah, sandi pendek, konfirmasi beda", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage);
    await fill(wrapper, { name: "n", email: "x", password: "123", confirm: "456" });
    const t = wrapper.text();
    expect(t).toContain("Format email tidak valid");
    expect(t).toContain("minimal 6 karakter");
    expect(t).toContain("Konfirmasi kata sandi tidak cocok");
  });

  it("sukses -> redirect ke login", async () => {
    vi.mocked(authApi.postRegister).mockResolvedValue({ status: "success", message: "ok" });
    const { wrapper, router } = await renderWithProviders(RegisterPage);
    await fill(wrapper, { name: "n", email: "a@b.co", password: "123456", confirm: "123456" });
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(lastIcon()).toBe("success");
  });

  it("gagal -> dialog error & status memproses", async () => {
    vi.mocked(authApi.postRegister).mockResolvedValue({ status: "fail", message: "dipakai" });
    const { wrapper, pinia } = await renderWithProviders(RegisterPage);
    await fill(wrapper, { name: "n", email: "a@b.co", password: "123456", confirm: "123456" });
    expect(lastIcon()).toBe("error");
    useAuthStore(pinia).isAuthRegister = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button[type=submit]").text()).toBe("Memproses...");
  });
});
