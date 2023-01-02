import axios from "axios";
import { env } from "../../env/client.mjs";

const getToken = async (googleJwtToken: string) => {
  const token = await axios.get(env.NEXT_PUBLIC_API_ROOT + "/auth/google", {
    params: {
      token: googleJwtToken,
    },
  });
  return token;
};
