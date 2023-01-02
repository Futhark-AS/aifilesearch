import { useLocalStorage } from "@mantine/hooks";
import { z } from "zod";

export const UserShchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    uid: z.string(),
})

export type User = z.infer<typeof UserShchema>;

export default function useUser() {
    const [user, setUser] = useLocalStorage<null | User>({key: "user", defaultValue: null});

    const [token, setToken] = useLocalStorage<null | string>({key: "token", defaultValue: null})
    const [uid, setUid] = useLocalStorage<null | string>({key: "uid", defaultValue: null})

    return {user, setUser, token, setToken, uid, setUid};
}