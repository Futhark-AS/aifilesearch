import { showNotification } from "@mantine/notifications";

export const showError = (message?: string) => {
    showNotification({
        title: "Error",
        message: message || "Unfortunately, an error occurred. Please try again later.",
        color: "red",
      });
    }