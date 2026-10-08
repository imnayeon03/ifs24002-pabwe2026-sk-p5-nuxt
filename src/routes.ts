import type { RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "./features/auth/states/authStore";

// Setiap halaman dimuat lazy (code splitting) agar bundle awal kecil.
const AuthLayout = () => import("./features/auth/layouts/AuthLayout.vue");
const LoginPage = () => import("./features/auth/pages/LoginPage.vue");
const RegisterPage = () => import("./features/auth/pages/RegisterPage.vue");
const CashFlowLayout = () => import("./features/cashflows/layouts/CashFlowLayout.vue");
const HomePage = () => import("./features/cashflows/pages/HomePage.vue");
const DetailPage = () => import("./features/cashflows/pages/DetailPage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guest: true },
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: HomePage },
      { path: "cash-flows/:cashFlowId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

/**
 * Penjaga rute: halaman terproteksi butuh login, halaman tamu (login/register)
 * dialihkan ke beranda bila sudah login. Mengembalikan true atau path tujuan.
 */
export function authGuard(to: Pick<RouteLocationNormalized, "matched">): true | string {
  const authStore = useAuthStore();

  if (to.matched.some((r) => r.meta.requiresAuth) && !authStore.isLoggedIn) {
    return "/auth/login";
  }
  if (to.matched.some((r) => r.meta.guest) && authStore.isLoggedIn) {
    return "/";
  }
  return true;
}
