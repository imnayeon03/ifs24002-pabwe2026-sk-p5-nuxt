import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { routes, authGuard } from "./routes";
import { putAccessToken } from "./helpers/apiHelper";
import userApi from "./features/users/api/userApi";
import cashFlowApi from "./features/cashflows/api/cashFlowApi";
import App from "./app.vue";

vi.mock("./features/users/api/userApi", () => ({ default: { getProfile: vi.fn() } }));
vi.mock("./features/cashflows/api/cashFlowApi", () => ({
  default: { getCashFlows: vi.fn(), getLabels: vi.fn() },
}));

async function run(path: string) {
  const pinia = createPinia();
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.beforeEach(authGuard);
  // Urutan sama seperti aplikasi: Pinia dipasang lebih dulu, baru router.
  const wrapper = mount(App, { global: { plugins: [pinia, router] } });
  router.push(path);
  await router.isReady();
  await flushPromises();
  return { wrapper, router };
}

describe("App (integrasi)", () => {
  it("pengguna belum login melihat halaman login", async () => {
    const { wrapper, router } = await run("/");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("Silakan masuk");
  });

  it("pengguna login melihat dashboard arus kas", async () => {
    putAccessToken("t");
    vi.mocked(userApi.getProfile).mockResolvedValue({
      status: "success", message: "ok", data: { user: { id: 1, name: "Budi", email: "b@x.id", photo: "p.png", created_at: "" } },
    });
    vi.mocked(cashFlowApi.getCashFlows).mockResolvedValue({
      status: "success", message: "ok", data: { cash_flows: [], stats: {} },
    });
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue({ status: "success", message: "ok", data: { labels: [] } });
    const { wrapper } = await run("/");
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Budi");
  });

  it("halaman register", async () => {
    const { wrapper } = await run("/auth/register");
    expect(wrapper.text()).toContain("Buat akun baru");
  });

  it("halaman 404", async () => {
    const { wrapper } = await run("/tidak-ada");
    expect(wrapper.text()).toContain("404");
  });
});
