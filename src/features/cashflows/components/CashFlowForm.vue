<script setup lang="ts">
import { ref } from "vue";
import { useInput } from "../../../hooks/useInput";
import type { CashFlowPayload, CashFlowSource, CashFlowType } from "../api/cashFlowApi";
import { SOURCE_LABELS, TYPE_LABELS } from "../utils";

const props = defineProps<{
  prefix: string;
  initial?: CashFlowPayload | null;
  busy?: boolean;
  submitLabel: string;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CashFlowPayload): void;
  (e: "cancel"): void;
}>();

const [type, onTypeChange] = useInput(props.initial?.type ?? "inflow");
const [source, onSourceChange] = useInput(props.initial?.source ?? "cash");
const [label, onLabelChange] = useInput(props.initial?.label ?? "");
const [nominal, onNominalChange] = useInput(props.initial ? String(props.initial.nominal) : "");
const [description, onDescriptionChange] = useInput(props.initial?.description ?? "");
const errors = ref<Record<string, string>>({});

function handleSubmit() {
  const result: Record<string, string> = {};
  if (!label.value) result.label = "Label wajib diisi";
  if (!(Number(nominal.value) > 0)) result.nominal = "Nominal harus lebih dari 0";
  if (!description.value) result.description = "Keterangan wajib diisi";
  errors.value = result;
  if (Object.keys(result).length) return;

  emit("submit", {
    type: type.value as CashFlowType,
    source: source.value as CashFlowSource,
    label: label.value,
    nominal: Number(nominal.value),
    description: description.value,
  });
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`${prefix}-type`" class="block text-sm font-medium text-slate-700">Jenis</label>
        <select :id="`${prefix}-type`" :value="type"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @change="onTypeChange">
          <option v-for="(text, key) in TYPE_LABELS" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
      <div>
        <label :for="`${prefix}-source`" class="block text-sm font-medium text-slate-700">Sumber Dana</label>
        <select :id="`${prefix}-source`" :value="source"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @change="onSourceChange">
          <option v-for="(text, key) in SOURCE_LABELS" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
    </div>

    <div>
      <label :for="`${prefix}-label`" class="block text-sm font-medium text-slate-700">Label</label>
      <input :id="`${prefix}-label`" type="text" :value="label" placeholder="Contoh: Gaji Bulanan"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onLabelChange" />
      <p v-if="errors.label" class="mt-1 text-sm text-red-600">{{ errors.label }}</p>
    </div>

    <div>
      <label :for="`${prefix}-nominal`" class="block text-sm font-medium text-slate-700">Nominal (Rp)</label>
      <input :id="`${prefix}-nominal`" type="number" :value="nominal"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onNominalChange" />
      <p v-if="errors.nominal" class="mt-1 text-sm text-red-600">{{ errors.nominal }}</p>
    </div>

    <div>
      <label :for="`${prefix}-description`" class="block text-sm font-medium text-slate-700">Keterangan</label>
      <textarea :id="`${prefix}-description`" rows="3" :value="description"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onDescriptionChange"></textarea>
      <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100" @click="emit('cancel')">
        Batal
      </button>
      <button type="submit" :disabled="busy"
        class="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        {{ busy ? "Menyimpan..." : submitLabel }}
      </button>
    </div>
  </form>
</template>
