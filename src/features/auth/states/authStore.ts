import { defineStore } from "pinia";
import authApi, { type LoginPayload, type RegisterPayload } from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  isApiSuccess,
} from "../../../helpers/apiHelper";

export interface AuthState {
  token: string | null;
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token,
  },

  actions: {
    async login(payload: LoginPayload): Promise<ActionResult> {
      this.isAuthLogin = true;
      const res = await authApi.postLogin(payload);
      this.isAuthLogin = false;

      const success = isApiSuccess(res);
      if (success && res.data) {
        this.token = res.data.token;
        putAccessToken(res.data.token);
      }
      return { success, message: res.message };
    },

    async register(payload: RegisterPayload): Promise<ActionResult> {
      this.isAuthRegister = true;
      const res = await authApi.postRegister(payload);
      this.isAuthRegister = false;
      return { success: isApiSuccess(res), message: res.message };
    },

    logout(): void {
      this.isAuthLogout = true;
      removeAccessToken();
      this.token = null;
      this.isAuthLogout = false;
    },
  },
});
