<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const [confirmPassword, onConfirmPasswordChange] = useInput("");
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  const result: Record<string, string> = {};

  if (!name.value) {
    result.name = "Nama wajib diisi";
  }

  if (!email.value) {
    result.email = "Email wajib diisi";
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    result.email = "Format email tidak valid";
  }

  if (!password.value) {
    result.password = "Kata sandi wajib diisi";
  } else if (password.value.length < 6) {
    result.password = "Kata sandi minimal 6 karakter";
  }

  if (confirmPassword.value !== password.value) {
    result.confirmPassword = "Konfirmasi kata sandi tidak cocok";
  }

  errors.value = result;
  return Object.keys(result).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;

  const result = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  if (result.success) {
    await showSuccessDialog(result.message);
    router.push("/auth/login");
  } else {
    showErrorDialog(result.message);
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Daftar</h1>
    <p class="mt-1 text-sm text-slate-600">Buat akun baru untuk mulai mencatat arus kas.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="name" class="block text-sm font-medium text-slate-700">Nama</label>
        <input id="name" type="text" :value="name" placeholder="Nama lengkap"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onNameChange" />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
        <input id="email" type="email" :value="email" placeholder="nama@email.com"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onEmailChange" />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-700">Kata Sandi</label>
        <input id="password" type="password" :value="password" placeholder="Minimal 6 karakter"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onPasswordChange" />
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-slate-700">Konfirmasi Kata Sandi</label>
        <input id="confirmPassword" type="password" :value="confirmPassword" placeholder="Ulangi kata sandi"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onConfirmPasswordChange" />
        <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
      </div>

      <button
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="w-full rounded-lg bg-emerald-700 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {{ authStore.isAuthRegister ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-emerald-700 hover:underline">Masuk</RouterLink>
    </p>
  </div>
</template>
