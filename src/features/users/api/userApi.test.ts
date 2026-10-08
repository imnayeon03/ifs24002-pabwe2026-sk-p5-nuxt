import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import userApi from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn().mockResolvedValue("res") }));

describe("userApi", () => {
  it("getUsers & getProfile", async () => {
    await userApi.getUsers();
    expect(fetchApi).toHaveBeenCalledWith("/users");
    await userApi.getProfile();
    expect(fetchApi).toHaveBeenCalledWith("/users/me");
  });
  it("putProfile", async () => {
    await userApi.putProfile({ name: "n", email: "e" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "n", email: "e" } });
  });
  it("postPhoto mengirim FormData field photo", async () => {
    await userApi.postPhoto(new File(["x"], "a.png"));
    const [path, opt] = vi.mocked(fetchApi).mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect((opt!.body as FormData).get("photo")).toBeInstanceOf(File);
  });
  it("putPassword memetakan field", async () => {
    await userApi.putPassword({ password: "a", newPassword: "b", confirmPassword: "c" });
    expect(fetchApi).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "b", new_password_confirmation: "c" },
    });
  });
});
