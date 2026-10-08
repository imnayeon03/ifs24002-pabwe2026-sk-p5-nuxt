import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("menampilkan banner dan area form", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout);
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.find("main").exists()).toBe(true);
  });
});
