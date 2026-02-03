import api from "@/lib/api";
import { authStorage, type StoredUser } from "@/lib/authStorage";

export type AuthUser = StoredUser;

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const authApi = {
  async login(email: string, password: string) {
    const response = await api.post<LoginResponse>("/login", { email, password });
    authStorage.setToken(response.data.token);
    authStorage.setUser(response.data.user);
    return response.data.user;
  },
  async me() {
    const response = await api.get<{ user: AuthUser }>("/me");
    authStorage.setUser(response.data.user);
    return response.data.user;
  },
  async logout() {
    try {
      await api.post("/logout");
    } finally {
      authStorage.clear();
    }
  },
  clear() {
    authStorage.clear();
  },
  getStoredUser() {
    return authStorage.getUser();
  },
  hasToken() {
    return Boolean(authStorage.getToken());
  },
};
