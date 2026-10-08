import { defineStore } from "pinia";
import userApi, {
  type User,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from "../api/userApi";
import { isApiSuccess } from "../../../helpers/apiHelper";
import type { ActionResult } from "../../auth/states/authStore";

export interface UsersState {
  users: User[];
  user: User | null;
  profile: User | null;
  isUsers: boolean;
  isProfile: boolean;
  isProfileChange: boolean;
  isProfileChanged: boolean;
  isPhotoChange: boolean;
  isPhotoChanged: boolean;
  isPasswordChange: boolean;
  isPasswordChanged: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    user: null,
    profile: null,
    isUsers: false,
    isProfile: false,
    isProfileChange: false,
    isProfileChanged: false,
    isPhotoChange: false,
    isPhotoChanged: false,
    isPasswordChange: false,
    isPasswordChanged: false,
  }),

  actions: {
    async fetchUsers(): Promise<ActionResult> {
      this.isUsers = true;
      const res = await userApi.getUsers();
      this.isUsers = false;
      const success = isApiSuccess(res);
      if (success && res.data) {
        this.users = res.data.users;
      }
      return { success, message: res.message };
    },

    async fetchProfile(): Promise<ActionResult> {
      this.isProfile = true;
      const res = await userApi.getProfile();
      this.isProfile = false;
      const success = isApiSuccess(res);
      if (success && res.data) {
        this.profile = res.data.user;
        this.user = res.data.user;
      }
      return { success, message: res.message };
    },

    async changeProfile(payload: UpdateProfilePayload): Promise<ActionResult> {
      this.isProfileChange = true;
      this.isProfileChanged = false;
      const res = await userApi.putProfile(payload);
      this.isProfileChange = false;
      const success = isApiSuccess(res);
      this.isProfileChanged = success;
      if (success && res.data) {
        this.profile = res.data.user;
      }
      return { success, message: res.message };
    },

    async changePhoto(file: File): Promise<ActionResult> {
      this.isPhotoChange = true;
      this.isPhotoChanged = false;
      const res = await userApi.postPhoto(file);
      this.isPhotoChange = false;
      const success = isApiSuccess(res);
      this.isPhotoChanged = success;
      return { success, message: res.message };
    },

    async changePassword(payload: ChangePasswordPayload): Promise<ActionResult> {
      this.isPasswordChange = true;
      this.isPasswordChanged = false;
      const res = await userApi.putPassword(payload);
      this.isPasswordChange = false;
      const success = isApiSuccess(res);
      this.isPasswordChanged = success;
      return { success, message: res.message };
    },
  },
});
