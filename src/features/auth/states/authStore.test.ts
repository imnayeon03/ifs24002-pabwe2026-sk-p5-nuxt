import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import authApi from "../api/authApi";
import { useAuthStore } from "./authStore";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi", () => ({ default: { postLogin: vi.fn(), postRegister: vi.fn() } }));

const credentials = { email: "a", password: "b" };

describe("authStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("state awal membaca token dari localStorage", () => {
    putAccessToken("old");
    const store = useAuthStore();
    expect(store.token).toBe("old");
    expect(store.isLoggedIn).toBe(true);
  });

  it("login sukses menyimpan token", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ status: "success", message: "ok", data: { token: "T" } });
    const store = useAuthStore();
    const res = await store.login(credentials);
    expect(res).toEqual({ success: true, message: "ok" });
    expect(store.token).toBe("T");
    expect(getAccessToken()).toBe("T");
    expect(store.isAuthLogin).toBe(false);
  });

  it("login sukses tanpa data tidak menyimpan token", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ status: "success", message: "ok" });
    const store = useAuthStore();
    expect((await store.login(credentials)).success).toBe(true);
    expect(store.token).toBeNull();
  });

  it("login gagal", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValue({ status: "fail", message: "salah" });
    const store = useAuthStore();
    expect(await store.login(credentials)).toEqual({ success: false, message: "salah" });
    expect(store.token).toBeNull();
  });

  it("register", async () => {
    const store = useAuthStore();
    vi.mocked(authApi.postRegister).mockResolvedValue({ status: "success", message: "ok" });
    expect(await store.register({ name: "n", ...credentials })).toEqual({ success: true, message: "ok" });
    expect(store.isAuthRegister).toBe(false);
  });

  it("logout menghapus token", () => {
    putAccessToken("t");
    const store = useAuthStore();
    store.logout();
    expect(store.token).toBeNull();
    expect(store.isLoggedIn).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(false);
  });
});
