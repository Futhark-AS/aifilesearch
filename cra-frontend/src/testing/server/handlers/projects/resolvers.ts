import { ResponseResolver, RestRequest, RestContext } from "msw";
import { delayedResponse } from "../../utils";

type HandlerResolver = ResponseResolver<RestRequest, RestContext>;

type ProjectBody = {
  projectId: string;
};

export const startProcessing: HandlerResolver = async (req, res, ctx) => {
  try {
    const data = (await req.json()) as ProjectBody;
    const result = {
      message: "success",
      uri: "https://test.com",
    };
    return delayedResponse(ctx.json(result));
  } catch (error: any) {
    return delayedResponse(
      ctx.status(400),
      ctx.json({ message: error?.message || "Server Error" })
    );
  }
};

export const getFiles: HandlerResolver = async (req, res, ctx) => {
  try {
    const result = [
      {
        id: "1",
        name: "file1",
        type: "file",
      },
      {
        id: "2",
        name: "file2",
        type: "file",
      },
    ];
    return delayedResponse(ctx.json(result));
  } catch (error: any) {
    return delayedResponse(
      ctx.status(400),
      ctx.json({ message: error?.message || "Server Error" })
    );
  }
};

export const getProjects: HandlerResolver = async (req, res, ctx) => {
  // return z.object({ projects: z.array(z.string()) }).parse(res.data).projects;
  try {
    const { user_id: userId } = req.params;
    const result = {
      projects: ["michael", "test"],
    };
    return delayedResponse(ctx.json(result));
  } catch (error: any) {
    return delayedResponse(
      ctx.status(400),
      ctx.json({ message: error?.message || "Server Error" })
    );
  }
};

export const query: HandlerResolver = async (req, res, ctx) => {
  try {
    const data = (await req.json()) as ProjectBody;
    const results = {
      matches: [
        {
          id: "1",
          score: 0.5,
          metadata: {
            page_number: 6,
            bounding_box: [
              [
                {
                  x: 1,
                  y: 1,
                },
              ],
            ],
            file_name: "file1",
            content: "content1",
          },
        },
        {
          id: "2",
          score: 0.5,
          metadata: {
            page_number: 2,
            bounding_box: [
              [
                {
                  x: 1,
                  y: 1,
                },
              ],
            ],
            file_name: "file2",
            content:
              "Las criptomonedas son activos digitales que utilizan la criptografía para realizar transacciones financieras seguras. Funcionan en redes descentralizadas, lo que significa que no están controladas por una única entidad, como un gobierno o una institución financiera. En su lugar, se basan en una red de usuarios para verificar y registrar las transacciones. Esto las convierte en una fuerza potencialmente disruptiva en el sector bancario tradicional, ya que ofrecen a particulares y empresas una forma alternativa de enviar y recibir dinero",
          },
        },
      ],
    };

    return delayedResponse(ctx.json(results));
  } catch (error: any) {
    return delayedResponse(
      ctx.status(400),
      ctx.json({ message: error?.message || "Server Error" })
    );
  }
};

export const getsastoken: HandlerResolver = async (req, res, ctx) => {
  return delayedResponse(
    ctx.json({
      token: "token",
      uri: "http://localhost:5173/public/test-pdf.pdf",
    })
  );
};
