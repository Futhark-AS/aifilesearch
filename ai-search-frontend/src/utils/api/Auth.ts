import axios from "axios";
import { AxiosInstance } from "axios";
import { env } from "../../env/client.mjs";
import { z } from "zod";

class ServerAuth {
  axios = {} as AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: env.NEXT_PUBLIC_API_ROOT,
      timeout: 10000,
    });
  }

  async getToken(googleToken: string) {
    const data = await this.axios.get("/auth/google", {
      params: {
        token: googleToken,
      },
    });

    return z.object({ token: z.string() }).parse(data.data).token;
  }
}

export default ServerAuth;
