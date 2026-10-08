<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChangeModal from "../components/modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import {
  showErrorDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from "../../../helpers/toolsHelper";
import { SOURCE_LABELS, TYPE_LABELS } from "../utils";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const showChange = ref(false);

async function load() {
  const result = await cashFlowsStore.fetchCashFlow(route.params.cashFlowId as string);
  if (!result.success) {
    showErrorDialog(result.message);
  }
}

async function handleDelete() {
  const confirmed = await showConfirmDialog("Hapus Transaksi", "Transaksi ini akan dihapus permanen.", "Hapus");
  if (!confirmed) return;

  const result = await cashFlowsStore.deleteCashFlow(cashFlowsStore.cashFlow!.id);
  if (result.success) {
    await showSuccessDialog(result.message);
    router.push("/");
  } else {
    showErrorDialog(result.message);
  }
}

onMounted(load);
</script>

<template>
  <section v-if="cashFlowsStore.cashFlow" class="mx-auto max-w-2xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ cashFlowsStore.cashFlow.label }}</h1>
        <span
          :class="[
            'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
            cashFlowsStore.cashFlow.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
          ]"
        >
          {{ TYPE_LABELS[cashFlowsStore.cashFlow.type] }}
        </span>
      </div>
      <p class="text-2xl font-bold text-slate-900">{{ formatRupiah(cashFlowsStore.cashFlow.nominal) }}</p>
    </div>

    <dl class="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
      <div>
        <dt class="text-sm text-slate-600">Sumber Dana</dt>
        <dd class="font-medium text-slate-900">{{ SOURCE_LABELS[cashFlowsStore.cashFlow.source] }}</dd>
      </div>
      <div>
        <dt class="text-sm text-slate-600">Label</dt>
        <dd class="font-medium text-slate-900">{{ cashFlowsStore.cashFlow.label }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-sm text-slate-600">Keterangan</dt>
        <dd class="font-medium text-slate-900">{{ cashFlowsStore.cashFlow.description }}</dd>
      </div>
      <div>
        <dt class="text-sm text-slate-600">Dibuat</dt>
        <dd class="font-medium text-slate-900">{{ formatDate(cashFlowsStore.cashFlow.created_at) }}</dd>
      </div>
      <div>
        <dt class="text-sm text-slate-600">Diperbarui</dt>
        <dd class="font-medium text-slate-900">{{ formatDate(cashFlowsStore.cashFlow.updated_at) }}</dd>
      </div>
    </dl>

    <div class="flex gap-2">
      <button class="rounded-lg border border-emerald-700 px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
        @click="showChange = true">Ubah</button>
      <button class="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
        @click="handleDelete">Hapus</button>
    </div>

    <ChangeModal :open="showChange" :cash-flow="cashFlowsStore.cashFlow" @close="showChange = false" @done="load" />
  </section>

  <p v-else class="text-slate-600">Memuat data...</p>
</template>
