import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import {
  createRouter,
  createMemoryHistory,
  type RouteRecordRaw,
} from "vue-router";

const Empty = { template: "<div />" };

export function createMockPinia(): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export function createTestRouter(
  routes: RouteRecordRaw[] = [{ path: "/:pathMatch(.*)*", component: Empty }]
) {
  return createRouter({ history: createMemoryHistory(), routes });
}

interface RenderOptions {
  props?: Record<string, unknown>;
  route?: string;
  routes?: RouteRecordRaw[];
  pinia?: Pinia;
}

export async function renderWithProviders(
  component: Component,
  { props = {}, route = "/", routes, pinia }: RenderOptions = {}
) {
  const usedPinia = pinia ?? createMockPinia();
  const router = createTestRouter(routes);
  router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    global: { plugins: [usedPinia, router] },
  });

  return { wrapper, router, pinia: usedPinia };
}
