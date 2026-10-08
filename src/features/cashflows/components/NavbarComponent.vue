<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Menu, LogOut, Wallet } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);

async function handleLogout() {
  const confirmed = await showConfirmDialog("Keluar", "Apakah kamu yakin ingin keluar?", "Keluar");
  if (!confirmed) return;

  authStore.logout();
  router.push("/auth/login");
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
    <div class="flex items-center gap-3">
      <button aria-label="Buka menu" class="rounded p-2 hover:bg-slate-100 lg:hidden"
        @click="$emit('toggle-sidebar')">
        <Menu class="size-5" />
      </button>
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-emerald-700">
        <Wallet class="size-5" /> Delcom Cash Flow
      </RouterLink>
    </div>

    <div class="flex items-center gap-3">
      <RouterLink v-if="profile" to="/profile" class="flex items-center gap-2">
        <img :src="profile.photo" alt="" class="size-8 rounded-full object-cover" />
        <span class="hidden text-left leading-tight sm:block">
          <span class="block text-sm font-medium text-slate-800">{{ profile.name }}</span>
          <span class="block text-xs text-slate-600">{{ profile.email }}</span>
        </span>
      </RouterLink>
      <span v-if="authStore.isLoggedIn"
        class="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 md:block">
        Sesi aktif
      </span>
      <button aria-label="Keluar" class="rounded p-2 text-slate-600 hover:bg-slate-100" @click="handleLogout">
        <LogOut class="size-5" />
      </button>
    </div>
  </header>
</template>
