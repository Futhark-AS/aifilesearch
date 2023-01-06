import { AuthSchema, UserState } from "@/features/auth/authSlice";

const storagePrefix = "aisearch";

const storage = {
  getUser: () => {
    const user = window.localStorage.getItem(`${storagePrefix}user`);

    if (!user) return null;
    const parsed = AuthSchema.safeParse(JSON.parse(user));

    if (!parsed.success) {
      console.error(parsed.error);
      return null;
    }

    return parsed.data;
  },
  setUser: (user: UserState) => {
    window.localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user));
  },
  clearUser: () => {
    window.localStorage.removeItem(`${storagePrefix}user`);
  },
};

export default storage;
