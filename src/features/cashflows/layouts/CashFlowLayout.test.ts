import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../../users/api/userApi";
import CashFlowLayout from "./CashFlowLayout.vue";

vi.mock("../../users/api/userApi", () => ({ default: { getProfile: vi.fn() } }));

describe("CashFlowLayout", () => {
  it("memuat profil, menampilkan navbar+sidebar, dan toggle drawer", async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue({
      status: "success", message: "ok", data: { user: { id: 1, name: "Budi", email: "b@x.id", photo: "p.png", created_at: "" } },
    });
    const { wrapper } = await renderWithProviders(CashFlowLayout);
    await flushPromises();
    expect(userApi.getProfile).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.find("[data-testid=sidebar-backdrop]").exists()).toBe(false);

    await wrapper.find("[aria-label='Buka menu']").trigger("click");
    expect(wrapper.find("[data-testid=sidebar-backdrop]").exists()).toBe(true);
    await wrapper.find("[data-testid=sidebar-backdrop]").trigger("click");
    expect(wrapper.find("[data-testid=sidebar-backdrop]").exists()).toBe(false);
  });
});
