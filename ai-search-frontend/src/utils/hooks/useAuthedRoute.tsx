import { useRouter } from "next/router";
import useUser from "./useUser";
import { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

export default function useAuthedRoute() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log(user)
    if (!user.user?.email) {
      console.log(user)
      router.push('/');
    }
  }, [user, router]);

    return user
}