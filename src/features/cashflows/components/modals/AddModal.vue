<script setup lang="ts">
import CashFlowForm from "../CashFlowForm.vue";
import { useCashFlowsStore } from "../../states/cashFlowsStore";
import type { CashFlowPayload } from "../../api/cashFlowApi";
import { showSuccessDialog, showErrorDialog } from "../../../../helpers/toolsHelper";

defineProps<{ open?: boolean }>();
const emit = defineEmits<{ (e: "close"): void; (e: "done"): void }>();

const cashFlowsStore = useCashFlowsStore();

async function handleSubmit(payload: CashFlowPayload) {
  const result = await cashFlowsStore.addCashFlow(payload);

  if (result.success) {
    await showSuccessDialog(result.message);
    emit("done");
    emit("close");
  } else {
    showErrorDialog(result.message);
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
      <h2 class="text-xl font-bold text-slate-900">Tambah Transaksi</h2>
      <div class="mt-4">
        <CashFlowForm prefix="add" submit-label="Simpan" :busy="cashFlowsStore.isCashFlowAdd"
          @submit="handleSubmit" @cancel="emit('close')" />
      </div>
    </div>
  </div>
</template>
