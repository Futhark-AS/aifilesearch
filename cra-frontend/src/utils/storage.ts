import { AuthSchema, UserState } from "@/features/auth/authSlice";

const storagePrefix = "aisearch";

const storage = {
  getUser: () => {
    const user = window.localStorage.getItem(`${storagePrefix}user`);
    if (!user) return null;
    return AuthSchema.parse(JSON.parse(user));
  },
  setUser: (user: UserState) => {
    window.localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user));
  },
  clearUser: () => {
    window.localStorage.removeItem(`${storagePrefix}user`);
  },
};

export default storage;
