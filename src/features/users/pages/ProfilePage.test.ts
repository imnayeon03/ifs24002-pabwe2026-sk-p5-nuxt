import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import ProfilePage from "./ProfilePage.vue";

vi.mock("../api/userApi", () => ({
  default: { getProfile: vi.fn(), putProfile: vi.fn(), postPhoto: vi.fn(), putPassword: vi.fn() },
}));

const ok = (data?: unknown) => ({ status: "success", message: "ok", data }) as never;
const fail = { status: "fail", message: "gagal" } as never;
const profile = { id: 1, name: "Budi", email: "b@x.id", photo: "p.png" };

async function mountPage() {
  vi.mocked(userApi.getProfile).mockResolvedValue(ok({ user: profile }));
  const r = await renderWithProviders(ProfilePage);
  await flushPromises();
  return r;
}
const icons = () => vi.mocked(Swal.fire).mock.calls.map((c) => (c[0] as { icon: string }).icon);
const value = (w: Awaited<ReturnType<typeof mountPage>>["wrapper"], sel: string) =>
  (w.find(sel).element as HTMLInputElement).value;

describe("ProfilePage", () => {
  it("mengisi form dari profil", async () => {
    const { wrapper } = await mountPage();
    expect(value(wrapper, "#name")).toBe("Budi");
    expect(value(wrapper, "#email")).toBe("b@x.id");
  });

  it("gagal memuat profil -> dialog error", async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue(fail);
    const { wrapper } = await renderWithProviders(ProfilePage);
    await flushPromises();
    expect(icons()).toEqual(["error"]);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("simpan profil: validasi", async () => {
    const { wrapper } = await mountPage();
    await wrapper.find("#name").setValue("");
    await wrapper.find("#email").setValue("");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(wrapper.text()).toContain("Nama wajib diisi");
    expect(wrapper.text()).toContain("Email wajib diisi");
    expect(userApi.putProfile).not.toHaveBeenCalled();
  });

  it("simpan profil: sukses & gagal", async () => {
    const { wrapper } = await mountPage();
    vi.mocked(userApi.putProfile).mockResolvedValue(ok({ user: { ...profile, name: "Baru" } }));
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(value(wrapper, "#name")).toBe("Baru");
    vi.mocked(userApi.putProfile).mockResolvedValue(fail);
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(icons()).toEqual(["success", "error"]);
  });

  it("ganti foto: tanpa file, sukses, gagal", async () => {
    const { wrapper } = await mountPage();
    const input = wrapper.find("[data-testid=photo-input]");

    Object.defineProperty(input.element, "files", { value: [], configurable: true });
    await input.trigger("change");
    expect(userApi.postPhoto).not.toHaveBeenCalled();

    Object.defineProperty(input.element, "files", { value: [new File(["x"], "a.png")], configurable: true });
    vi.mocked(userApi.postPhoto).mockResolvedValue(ok());
    await input.trigger("change");
    await flushPromises();
    expect(userApi.getProfile).toHaveBeenCalledTimes(2);

    vi.mocked(userApi.postPhoto).mockResolvedValue(fail);
    await input.trigger("change");
    await flushPromises();
    expect(icons()).toEqual(["success", "error"]);
  });

  it("ganti sandi: validasi", async () => {
    const { wrapper } = await mountPage();
    await wrapper.find("#newPassword").setValue("baru");
    await wrapper.findAll("form")[1].trigger("submit");
    const t = wrapper.text();
    expect(t).toContain("Kata sandi lama wajib diisi");
    expect(t).toContain("Konfirmasi kata sandi tidak cocok");
    await wrapper.find("#newPassword").setValue("");
    await wrapper.findAll("form")[1].trigger("submit");
    expect(wrapper.text()).toContain("Kata sandi baru wajib diisi");
  });

  it("ganti sandi: sukses mereset form, gagal", async () => {
    const { wrapper } = await mountPage();
    const fillPasswords = async () => {
      await wrapper.find("#password").setValue("lama");
      await wrapper.find("#newPassword").setValue("baru");
      await wrapper.find("#confirmPassword").setValue("baru");
    };
    await fillPasswords();
    vi.mocked(userApi.putPassword).mockResolvedValue(ok());
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(userApi.putPassword).toHaveBeenCalledWith({ password: "lama", newPassword: "baru", confirmPassword: "baru" });
    expect(value(wrapper, "#password")).toBe("");

    await fillPasswords();
    vi.mocked(userApi.putPassword).mockResolvedValue(fail);
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(icons()).toEqual(["success", "error"]);
  });
});
