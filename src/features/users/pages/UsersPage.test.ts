import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import { useUsersStore } from "../states/usersStore";
import UsersPage from "./UsersPage.vue";

vi.mock("../api/userApi", () => ({ default: { getUsers: vi.fn() } }));

describe("UsersPage", () => {
  it("menampilkan daftar pengguna", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({
      status: "success", message: "ok",
      data: { users: [{ id: 1, name: "Budi", email: "b@x.id", photo: "p.png", created_at: "2024-10-05T03:26:57Z" }] },
    });
    const { wrapper } = await renderWithProviders(UsersPage);
    await flushPromises();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("b@x.id");
  });

  it("kosong", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({ status: "success", message: "ok", data: { users: [] } });
    const { wrapper } = await renderWithProviders(UsersPage);
    await flushPromises();
    expect(wrapper.text()).toContain("Belum ada pengguna");
  });

  it("loading", async () => {
    vi.mocked(userApi.getUsers).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(useUsersStore().isUsers).toBe(true);
    expect(wrapper.text()).toContain("Memuat data");
  });

  it("gagal -> dialog error", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({ status: "fail", message: "boom" });
    await renderWithProviders(UsersPage);
    await flushPromises();
    expect(vi.mocked(Swal.fire).mock.calls[0][0]).toMatchObject({ icon: "error", text: "boom" });
  });
});
