import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("menampilkan 404 dan tautan beranda", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.find("a").attributes("href")).toBe("/");
  });
});
