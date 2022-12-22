import { z } from "zod";

export const ResultSchema = z
	.object({
		similarities: z.number(),
		law_name: z.string(),
		chapter: z.string(),
		paragraph_body: z.string(),
		paragraph_title: z.string()
	})
	.transform((val) => {
		return {
		    similarities: val.similarities,
			lawName: val.law_name,
            chapter: val.chapter,
			paragraphBody: val.paragraph_body,
			paragraphTitle: val.paragraph_title
		};
	});

export type LawResult = z.infer<ResultSchema>