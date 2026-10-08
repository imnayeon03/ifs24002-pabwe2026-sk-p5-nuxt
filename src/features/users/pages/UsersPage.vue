<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog, formatDate } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

onMounted(async () => {
  const result = await usersStore.fetchUsers();
  if (!result.success) {
    showErrorDialog(result.message);
  }
});
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold text-slate-900">Daftar Pengguna</h1>

    <p v-if="usersStore.isUsers" class="mt-6 text-slate-600">Memuat data...</p>
    <p v-else-if="usersStore.users.length === 0" class="mt-6 text-slate-600">
      Belum ada pengguna.
    </p>

    <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="user in usersStore.users"
        :key="user.id"
        class="flex items-center gap-4 rounded-xl bg-white p-4 shadow"
      >
        <img :src="user.photo" alt="" class="size-12 rounded-full object-cover" />
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-600">{{ user.email }}</p>
          <p class="text-xs text-slate-600">Bergabung {{ formatDate(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
