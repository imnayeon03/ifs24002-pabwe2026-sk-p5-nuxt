<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange, resetPassword] = useInput("");
const [newPassword, onNewPasswordChange, resetNewPassword] = useInput("");
const [confirmPassword, onConfirmPasswordChange, resetConfirmPassword] = useInput("");
const profileErrors = ref<Record<string, string>>({});
const passwordErrors = ref<Record<string, string>>({});

onMounted(async () => {
  const result = await usersStore.fetchProfile();
  if (!result.success) {
    showErrorDialog(result.message);
  }
});

watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) {
      onNameChange(profile.name);
      onEmailChange(profile.email);
    }
  },
  { immediate: true }
);

async function handleSubmitProfile() {
  const errors: Record<string, string> = {};
  if (!name.value) errors.name = "Nama wajib diisi";
  if (!email.value) errors.email = "Email wajib diisi";
  profileErrors.value = errors;
  if (Object.keys(errors).length) return;

  const result = await usersStore.changeProfile({ name: name.value, email: email.value });
  if (result.success) {
    showSuccessDialog(result.message);
  } else {
    showErrorDialog(result.message);
  }
}

async function handlePhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const result = await usersStore.changePhoto(file);
  if (result.success) {
    await showSuccessDialog(result.message);
    await usersStore.fetchProfile();
  } else {
    showErrorDialog(result.message);
  }
}

async function handleSubmitPassword() {
  const errors: Record<string, string> = {};
  if (!password.value) errors.password = "Kata sandi lama wajib diisi";
  if (!newPassword.value) errors.newPassword = "Kata sandi baru wajib diisi";
  if (confirmPassword.value !== newPassword.value) {
    errors.confirmPassword = "Konfirmasi kata sandi tidak cocok";
  }
  passwordErrors.value = errors;
  if (Object.keys(errors).length) return;

  const result = await usersStore.changePassword({
    password: password.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  });

  if (result.success) {
    resetPassword();
    resetNewPassword();
    resetConfirmPassword();
    showSuccessDialog(result.message);
  } else {
    showErrorDialog(result.message);
  }
}
</script>

<template>
  <section class="space-y-8">
    <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>

    <div class="rounded-xl bg-white p-6 shadow">
      <div v-if="usersStore.profile" class="flex items-center gap-4">
        <img :src="usersStore.profile.photo" alt="Foto profil" class="size-20 rounded-full object-cover" />
        <label class="cursor-pointer rounded-lg border border-emerald-700 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
          Ganti Foto
          <input data-testid="photo-input" type="file" accept="image/*" class="hidden" @change="handlePhotoChange" />
        </label>
      </div>

      <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSubmitProfile">
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700">Nama</label>
          <input id="name" type="text" :value="name"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onNameChange" />
          <p v-if="profileErrors.name" class="mt-1 text-sm text-red-600">{{ profileErrors.name }}</p>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input id="email" type="email" :value="email"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onEmailChange" />
          <p v-if="profileErrors.email" class="mt-1 text-sm text-red-600">{{ profileErrors.email }}</p>
        </div>
        <button type="submit" :disabled="usersStore.isProfileChange"
          class="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {{ usersStore.isProfileChange ? "Menyimpan..." : "Simpan Profil" }}
        </button>
      </form>
    </div>

    <div class="rounded-xl bg-white p-6 shadow">
      <h2 class="text-lg font-semibold text-slate-900">Ganti Kata Sandi</h2>
      <form class="mt-4 space-y-4" novalidate @submit.prevent="handleSubmitPassword">
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">Kata Sandi Lama</label>
          <input id="password" type="password" :value="password"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onPasswordChange" />
          <p v-if="passwordErrors.password" class="mt-1 text-sm text-red-600">{{ passwordErrors.password }}</p>
        </div>
        <div>
          <label for="newPassword" class="block text-sm font-medium text-slate-700">Kata Sandi Baru</label>
          <input id="newPassword" type="password" :value="newPassword"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onNewPasswordChange" />
          <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600">{{ passwordErrors.newPassword }}</p>
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-slate-700">Konfirmasi Kata Sandi Baru</label>
          <input id="confirmPassword" type="password" :value="confirmPassword"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" @input="onConfirmPasswordChange" />
          <p v-if="passwordErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ passwordErrors.confirmPassword }}</p>
        </div>
        <button type="submit" :disabled="usersStore.isPasswordChange"
          class="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {{ usersStore.isPasswordChange ? "Menyimpan..." : "Ganti Kata Sandi" }}
        </button>
      </form>
    </div>
  </section>
</template>
