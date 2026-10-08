<script setup lang="ts">
import { Wallet } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-slate-50">
    <aside class="hidden lg:flex flex-col justify-between bg-emerald-700 p-12 text-white">
      <div class="flex items-center gap-2 text-xl font-bold">
        <Wallet class="size-6" />
        Delcom Cash Flow
      </div>
      <div>
        <h2 class="text-4xl font-bold leading-tight">
          Catat setiap rupiah, kendalikan arus kasmu.
        </h2>
        <p class="mt-4 text-emerald-100">
          Pantau pemasukan, pengeluaran, tabungan, dan pinjaman dalam satu tempat.
        </p>
      </div>
      <p class="text-sm text-emerald-100">© 2026 Delcom Cash Flow</p>
    </aside>

    <main class="flex items-center justify-center p-6">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <RouterView />
      </div>
    </main>
  </div>
</template>
