import { authGuard } from "../routes";

// Middleware global Nuxt: dijalankan pada setiap navigasi, termasuk yang pertama.
export default defineNuxtRouteMiddleware((to) => {
  const result = authGuard(to);
  if (result !== true) {
    return navigateTo(result);
  }
});
