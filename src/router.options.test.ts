import { describe, it, expect } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import routerOptions from "./router.options";
import { routes, authGuard } from "./routes";
import { putAccessToken } from "./helpers/apiHelper";

function setup() {
  setActivePinia(createPinia());
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.beforeEach(authGuard);
  return router;
}

describe("router.options", () => {
  it("mengarahkan Nuxt ke rute dari routes.ts", () => {
    const resolve = routerOptions.routes as () => unknown;
    expect(resolve()).toBe(routes);
  });

  it("mendefinisikan rute sesuai spesifikasi", () => {
    const paths = routes.flatMap((r) => [r.path, ...(r.children ?? []).map((c) => c.path)]);
    expect(paths).toEqual(
      expect.arrayContaining([
        "/auth", "login", "register", "/", "", "cash-flows/:cashFlowId", "users", "profile", "/:pathMatch(.*)*",
      ])
    );
  });

  it("semua halaman bisa dimuat secara lazy", async () => {
    const loaders = routes
      .flatMap((r) => [r, ...(r.children ?? [])])
      .map((r) => r.component as () => Promise<{ default: unknown }>);
    const modules = await Promise.all(loaders.map((load) => load()));
    modules.forEach((m) => expect(m.default).toBeTruthy());
    expect(modules).toHaveLength(9);
  });

  it("belum login -> halaman terproteksi diarahkan ke login", async () => {
    const router = setup();
    await router.push("/users");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("sudah login -> boleh masuk, halaman guest diarahkan ke beranda", async () => {
    putAccessToken("t");
    const router = setup();
    await router.push("/profile");
    expect(router.currentRoute.value.path).toBe("/profile");
    await router.push("/auth/login");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("rute tak dikenal -> 404 tanpa perlu login", async () => {
    const router = setup();
    await router.push("/ngawur");
    expect(router.currentRoute.value.matched[0].path).toBe("/:pathMatch(.*)*");
  });

  it("authGuard mengembalikan true untuk rute bebas", () => {
    setActivePinia(createPinia());
    expect(authGuard({ matched: [{ meta: {} }] } as never)).toBe(true);
  });
});
