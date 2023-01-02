import { z } from "zod";

const GoogleJwtSchema = z.object({
  iss: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  name: z.string(),
  picture: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  iat: z.number(),
  exp: z.number(),
  jti: z.string(),
});

export function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url?.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64!)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return GoogleJwtSchema.parse(JSON.parse(jsonPayload));
}
