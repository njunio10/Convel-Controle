export type StoredUser = {
  id: number;
  name: string;
  email: string;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const readJSON = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): StoredUser | null {
    return readJSON<StoredUser>(localStorage.getItem(USER_KEY));
  },
  setUser(user: StoredUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
