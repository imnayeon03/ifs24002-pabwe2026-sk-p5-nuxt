<script setup lang="ts">
import { ref, onMounted } from "vue";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";

const usersStore = useUsersStore();
const sidebarOpen = ref(false);

onMounted(() => {
  usersStore.fetchProfile();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex">
      <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
      <main class="min-w-0 flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
