import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import userApi from "../api/userApi";
import { useUsersStore } from "./usersStore";

vi.mock("../api/userApi", () => ({
  default: { getUsers: vi.fn(), getProfile: vi.fn(), putProfile: vi.fn(), postPhoto: vi.fn(), putPassword: vi.fn() },
}));

const user = (id: number) => ({ id, name: "n", email: "e", photo: "p", created_at: "" });
const ok = (data?: unknown) => ({ status: "success", message: "ok", data }) as never;
const fail = { status: "fail", message: "gagal" } as never;

describe("usersStore", () => {
  let store: ReturnType<typeof useUsersStore>;
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUsersStore();
  });

  it("fetchUsers", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue(ok({ users: [user(1)] }));
    expect((await store.fetchUsers()).success).toBe(true);
    expect(store.users).toEqual([user(1)]);
    vi.mocked(userApi.getUsers).mockResolvedValue(fail);
    expect(await store.fetchUsers()).toEqual({ success: false, message: "gagal" });
    expect(store.users).toEqual([user(1)]);
    expect(store.isUsers).toBe(false);
  });

  it("fetchUsers sukses tanpa data tidak mengubah state", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue(ok());
    await store.fetchUsers();
    expect(store.users).toEqual([]);
  });

  it("fetchProfile", async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue(ok({ user: user(2) }));
    await store.fetchProfile();
    expect(store.profile).toEqual(user(2));
    expect(store.user).toEqual(user(2));
    vi.mocked(userApi.getProfile).mockResolvedValue(fail);
    expect((await store.fetchProfile()).success).toBe(false);
    vi.mocked(userApi.getProfile).mockResolvedValue(ok());
    await store.fetchProfile();
    expect(store.profile).toEqual(user(2));
  });

  it("changeProfile", async () => {
    vi.mocked(userApi.putProfile).mockResolvedValue(ok({ user: user(3) }));
    await store.changeProfile({ name: "n", email: "e" });
    expect(store.profile).toEqual(user(3));
    expect(store.isProfileChanged).toBe(true);
    vi.mocked(userApi.putProfile).mockResolvedValue(fail);
    await store.changeProfile({ name: "n", email: "e" });
    expect(store.isProfileChanged).toBe(false);
    vi.mocked(userApi.putProfile).mockResolvedValue(ok());
    await store.changeProfile({ name: "n", email: "e" });
    expect(store.profile).toEqual(user(3));
  });

  it("changePhoto", async () => {
    const file = new File(["x"], "a.png");
    vi.mocked(userApi.postPhoto).mockResolvedValue(ok());
    expect((await store.changePhoto(file)).success).toBe(true);
    expect(store.isPhotoChanged).toBe(true);
    vi.mocked(userApi.postPhoto).mockResolvedValue(fail);
    await store.changePhoto(file);
    expect(store.isPhotoChanged).toBe(false);
  });

  it("changePassword", async () => {
    const payload = { password: "a", newPassword: "b", confirmPassword: "b" };
    vi.mocked(userApi.putPassword).mockResolvedValue(ok());
    expect((await store.changePassword(payload)).success).toBe(true);
    expect(store.isPasswordChanged).toBe(true);
    vi.mocked(userApi.putPassword).mockResolvedValue(fail);
    await store.changePassword(payload);
    expect(store.isPasswordChanged).toBe(false);
  });
});
