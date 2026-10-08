import { fetchApi } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

const userApi = {
  getUsers: () => fetchApi<{ users: User[] }>("/users"),

  getProfile: () => fetchApi<{ user: User }>("/users/me"),

  putProfile: ({ name, email }: UpdateProfilePayload) =>
    fetchApi<{ user: User }>("/users/me", { method: "PUT", body: { name, email } }),

  postPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return fetchApi("/users/me/photo", { method: "POST", body: formData });
  },

  putPassword: ({ password, newPassword, confirmPassword }: ChangePasswordPayload) =>
    fetchApi("/users/password", {
      method: "PUT",
      body: {
        password,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      },
    }),
};

export default userApi;
