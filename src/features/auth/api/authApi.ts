import { fetchApi } from "../../../helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface LoginData {
  token: string;
}

const authApi = {
  postLogin: ({ email, password }: LoginPayload) =>
    fetchApi<LoginData>("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  postRegister: ({ name, email, password }: RegisterPayload) =>
    fetchApi("/auth/register", { method: "POST", body: { name, email, password }, auth: false }),
};

export default authApi;
