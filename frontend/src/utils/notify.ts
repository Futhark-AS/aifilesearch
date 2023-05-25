import storage from "./storage";

export const notifyOfEvent = async (messages: string[]) => {
  const url = import.meta.env.VITE_ENV_NOTIFY_URL_ENDPOINT;
  const to = import.meta.env.VITE_ENV_NOTIFIER_DESTINATION;
  if (!url) {
    return;
  }
  fetch(url, {
    method: "POST",
    body: JSON.stringify({ to, messages }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// error func
export const notifyError = (msg: string, error: unknown) => {
  const strRep = String(error);
  const userId = storage.getAzureToken() || "unknown";
  const notifyMsg = `ERROR: ${msg}: ${strRep} for user ${userId}`;
  notifyOfEvent([notifyMsg]);
};
