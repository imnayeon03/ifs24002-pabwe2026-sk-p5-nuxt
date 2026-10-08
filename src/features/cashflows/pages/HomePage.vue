<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";
import AddModal from "../components/modals/AddModal.vue";
import ChangeModal from "../components/modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlow, CashFlowQueryParams } from "../api/cashFlowApi";
import {
  showErrorDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from "../../../helpers/toolsHelper";
import {
  SOURCE_LABELS,
  TYPE_LABELS,
  sourceBalance,
  statValue,
  toStartOfDay,
  toEndOfDay,
} from "../utils";

const cashFlowsStore = useCashFlowsStore();

const filters = reactive({ type: "", source: "", label: "", startDate: "", endDate: "" });
const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const cards = computed(() => {
  const stats = cashFlowsStore.stats;
  return [
    { title: "Total Saldo Kas Bersih", value: statValue(stats, "cashflow") },
    { title: "Total Pemasukan", value: statValue(stats, "total_inflow") },
    { title: "Total Pengeluaran", value: statValue(stats, "total_outflow") },
    { title: "Saldo Kas Tunai", value: sourceBalance(stats, "cash") },
    { title: "Saldo Tabungan", value: sourceBalance(stats, "savings") },
    { title: "Saldo Pinjaman", value: sourceBalance(stats, "loans") },
  ];
});

function buildQuery(): CashFlowQueryParams {
  return {
    type: filters.type as CashFlowQueryParams["type"],
    source: filters.source as CashFlowQueryParams["source"],
    label: filters.label,
    start_date: filters.startDate ? toStartOfDay(filters.startDate) : "",
    end_date: filters.endDate ? toEndOfDay(filters.endDate) : "",
  };
}

async function load() {
  const result = await cashFlowsStore.fetchCashFlows(buildQuery());
  if (!result.success) {
    showErrorDialog(result.message);
  }
}

function resetFilters() {
  Object.assign(filters, { type: "", source: "", label: "", startDate: "", endDate: "" });
  load();
}

async function handleDelete(cashFlow: CashFlow) {
  const confirmed = await showConfirmDialog(
    "Hapus Transaksi",
    `Transaksi "${cashFlow.label}" akan dihapus permanen.`,
    "Hapus"
  );
  if (!confirmed) return;

  const result = await cashFlowsStore.deleteCashFlow(cashFlow.id);
  if (result.success) {
    await showSuccessDialog(result.message);
    load();
  } else {
    showErrorDialog(result.message);
  }
}

async function handleDeleteAll() {
  const confirmed = await showConfirmDialog(
    "Reset Semua Transaksi",
    "Seluruh catatan arus kasmu akan dihapus permanen.",
    "Reset"
  );
  if (!confirmed) return;

  const result = await cashFlowsStore.deleteAllCashFlows();
  if (result.success) {
    await showSuccessDialog(result.message);
    load();
  } else {
    showErrorDialog(result.message);
  }
}

onMounted(() => {
  load();
  cashFlowsStore.fetchLabels();
});
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900">Ringkasan Arus Kas</h1>
      <div class="flex gap-2">
        <button class="flex items-center gap-1 rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          @click="handleDeleteAll">
          <Trash2 class="size-4" /> Reset Transaksi
        </button>
        <button class="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          @click="showAdd = true">
          <Plus class="size-4" /> Tambah Transaksi
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="card in cards" :key="card.title" class="rounded-xl bg-white p-4 shadow" data-testid="metric-card">
        <p class="text-sm text-slate-600">{{ card.title }}</p>
        <p class="mt-1 text-xl font-bold text-slate-900">{{ formatRupiah(card.value) }}</p>
      </div>
    </div>

    <form class="mt-6 grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="load">
      <div>
        <label for="f-type" class="block text-xs font-medium text-slate-700">Jenis</label>
        <select id="f-type" v-model="filters.type" class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm">
          <option value="">Semua</option>
          <option v-for="(text, key) in TYPE_LABELS" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
      <div>
        <label for="f-source" class="block text-xs font-medium text-slate-700">Sumber Dana</label>
        <select id="f-source" v-model="filters.source" class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm">
          <option value="">Semua</option>
          <option v-for="(text, key) in SOURCE_LABELS" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
      <div>
        <label for="f-label" class="block text-xs font-medium text-slate-700">Label</label>
        <select id="f-label" v-model="filters.label" class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm">
          <option value="">Semua</option>
          <option v-for="label in cashFlowsStore.labels" :key="label" :value="label">{{ label }}</option>
        </select>
      </div>
      <div>
        <label for="f-start" class="block text-xs font-medium text-slate-700">Tanggal Awal</label>
        <input id="f-start" v-model="filters.startDate" type="date" class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
      </div>
      <div>
        <label for="f-end" class="block text-xs font-medium text-slate-700">Tanggal Akhir</label>
        <input id="f-end" v-model="filters.endDate" type="date" class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
      </div>
      <div class="flex items-end gap-2">
        <button type="submit" class="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
          Terapkan
        </button>
        <button type="button" class="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" @click="resetFilters">
          Reset
        </button>
      </div>
    </form>

    <p v-if="cashFlowsStore.isCashFlow" class="mt-6 text-slate-600">Memuat data...</p>
    <p v-else-if="cashFlowsStore.cashFlows.length === 0" class="mt-6 text-slate-600">
      Belum ada transaksi.
    </p>

    <div v-else class="mt-6 overflow-x-auto rounded-xl bg-white shadow">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 text-slate-700">
          <tr>
            <th scope="col" class="px-4 py-3">Tanggal</th>
            <th scope="col" class="px-4 py-3">Label</th>
            <th scope="col" class="px-4 py-3">Sumber</th>
            <th scope="col" class="px-4 py-3">Jenis</th>
            <th scope="col" class="px-4 py-3 text-right">Nominal</th>
            <th scope="col" class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in cashFlowsStore.cashFlows" :key="item.id" data-testid="cash-flow-row">
            <td class="px-4 py-3 text-slate-700">{{ formatDate(item.created_at) }}</td>
            <td class="px-4 py-3 font-medium text-slate-900">{{ item.label }}</td>
            <td class="px-4 py-3 text-slate-700">{{ SOURCE_LABELS[item.source] }}</td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  item.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                ]"
              >
                {{ TYPE_LABELS[item.type] }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ formatRupiah(item.nominal) }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-3">
                <RouterLink :to="`/cash-flows/${item.id}`" class="font-medium text-emerald-700 hover:underline">Detail</RouterLink>
                <button class="font-medium text-slate-700 hover:underline" @click="editing = item">Ubah</button>
                <button class="font-medium text-red-700 hover:underline" @click="handleDelete(item)">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddModal :open="showAdd" @close="showAdd = false" @done="load" />
    <ChangeModal :open="!!editing" :cash-flow="editing" @close="editing = null" @done="load" />
  </section>
</template>
