import { z } from 'zod';

export const ResultSchema = z
	.object({
		law_name: z.string(),
		items: z.array(
			z.object({
				id: z.string(),
				similarities: z.number(),
				law_name: z.string(),
				chapter: z.string(),
				paragraph: z.string(),
				paragraph_title: z.string()
			})
		)
	})
	.transform((val) => {
		return {
			law_name: val.law_name,
			items: val.items.map((item) => ({
				id: item.id,
				similarities: item.similarities,
				law_name: item.law_name,
				chapter: item.chapter,
				paragraph: item.paragraph_body,
				paragraph_title: item.paragraph_title
			}))
		};
	});

export type LawResult = z.infer<ResultSchema>;

/* import * as Z from 'zod';

const ZipOutputSchema = Z.object({
	law_name: Z.string(),
	items: Z.array(
		Z.object({
			id: Z.string(),
			similarities: Z.number(),
			law_name: Z.string(),
			chapter: Z.string(),
			paragraph_title: Z.string(),
			paragraph: Z.string()
			// Add other properties as needed
		})
	)
});

export type ZipOutput = Z.infer<typeof ZipOutputSchema>; */
