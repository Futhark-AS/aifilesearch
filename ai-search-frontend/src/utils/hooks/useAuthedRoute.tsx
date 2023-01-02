import { useRouter } from "next/router";
import useUser from "./useUser";
import { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

export default function useAuthedRoute() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user.user) {
      router.push('/');
      showNotification({
        id: 'hello-there',
        disallowClose: true,
        onClose: () => console.log('unmounted'),
        onOpen: () => console.log('mounted'),
        autoClose: 5000,
        title: "You've been compromised",
        message: 'Leave the building immediately',
        color: 'red',
        // icon: <IconX />,
        className: 'my-notification-class',
        style: { backgroundColor: 'red' },
        sx: { backgroundColor: 'red' },
        loading: false,
      });
    }
  }, [user, router]);

    return user
}