import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import authApi from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn().mockResolvedValue("res") }));

describe("authApi", () => {
  it("postLogin", async () => {
    expect(await authApi.postLogin({ email: "a", password: "b" })).toBe("res");
    expect(fetchApi).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a", password: "b" }, auth: false });
  });
  it("postRegister", async () => {
    await authApi.postRegister({ name: "n", email: "a", password: "b" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/register", { method: "POST", body: { name: "n", email: "a", password: "b" }, auth: false });
  });
});
