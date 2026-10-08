<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  const result: Record<string, string> = {};

  if (!email.value) {
    result.email = "Email wajib diisi";
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    result.email = "Format email tidak valid";
  }

  if (!password.value) {
    result.password = "Kata sandi wajib diisi";
  }

  errors.value = result;
  return Object.keys(result).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;

  const result = await authStore.login({ email: email.value, password: password.value });

  if (result.success) {
    await showSuccessDialog(result.message);
    router.push("/");
  } else {
    showErrorDialog(result.message);
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Masuk</h1>
    <p class="mt-1 text-sm text-slate-600">Silakan masuk untuk mengelola arus kasmu.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="login-email-input" class="block text-sm font-medium text-slate-700">Email</label>
        <input
          id="login-email-input"
          type="email"
          :value="email"
          placeholder="nama@email.com"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onEmailChange"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <div>
        <label for="login-password-input" class="block text-sm font-medium text-slate-700">Kata Sandi</label>
        <input
          id="login-password-input"
          type="password"
          :value="password"
          placeholder="••••••••"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          @input="onPasswordChange"
        />
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full rounded-lg bg-emerald-700 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-emerald-700 hover:underline">Daftar</RouterLink>
    </p>
  </div>
</template>
