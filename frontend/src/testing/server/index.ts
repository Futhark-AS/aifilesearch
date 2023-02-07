export const initMocks = async () => {
  // Mocking is initted if the env var VITE_MOCKED_API is set to true in a .env file in the root of the project
  if (import.meta.env.VITE_MOCKED_API === "true") {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { server } = await import("./server");
      console.log("running server worker");
      server.listen();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { worker } = await import("./browser");
      console.log("running browser worker");

      worker.start({
        onUnhandledRequest(req) {
          console.error(
            'Found an unhandled %s requestt to %s',
            req.method,
            req.url.href,
          )
        },
      });
    }
  }
};
