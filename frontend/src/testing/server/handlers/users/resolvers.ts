import { ResponseResolver, RestRequest, RestContext } from "msw";
import { delayedResponse } from "../../utils";

type HandlerResolver = ResponseResolver<RestRequest, RestContext>;

type ProjectBody = {
  email: string;
  name: string;
};

export const updateProfile: HandlerResolver = async (req, res, ctx) => {
  try {
    const data = (await req.json()) as ProjectBody;

    return delayedResponse(
      ctx.json({
        email: data.email,
        name: data.name,
      })
    );
  } catch (error: any) {
    return delayedResponse(
      ctx.status(400),
      ctx.json({ message: error?.message || "Server Error" })
    );
  }
};