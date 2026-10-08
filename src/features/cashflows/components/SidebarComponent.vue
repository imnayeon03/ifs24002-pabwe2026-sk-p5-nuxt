<script setup lang="ts">
import { LayoutDashboard, Users, User } from "lucide-vue-next";

defineProps<{ open?: boolean }>();
defineEmits<{ (e: "close"): void }>();

const menus = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard },
  { to: "/users", label: "Direktori Pengguna", icon: Users },
  { to: "/profile", label: "Profil Saya", icon: User },
];
</script>

<template>
  <div v-if="open" data-testid="sidebar-backdrop" class="fixed inset-0 z-30 bg-black/40 lg:hidden"
    @click="$emit('close')"></div>

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 bg-white p-4 pt-20 shadow transition-transform lg:static lg:translate-x-0 lg:pt-4',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <nav class="space-y-1">
      <RouterLink
        v-for="menu in menus"
        :key="menu.label"
        :to="menu.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
        @click="$emit('close')"
      >
        <component :is="menu.icon" class="size-5" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
