import { AuthSchema, UserState } from "@/features/auth/authSlice";
import { getUser } from "@/features/projects/requests";

const storagePrefix = "aisearch";

const storage = {
  getUser: () => {
    const user = window.localStorage.getItem(`${storagePrefix}user`);

    if (!user) return null;
    const parsed = AuthSchema.safeParse(JSON.parse(user));

    if (!parsed.success) {
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
  refetchStorage: () => {
    const user = getUser()
    const newUser = Object.assign({}, storage.getUser(), user)
    storage.setUser(newUser)
    }
};

export default storage;
