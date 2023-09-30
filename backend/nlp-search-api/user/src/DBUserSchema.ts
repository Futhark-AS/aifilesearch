import {z} from "zod"

export const userSchema = z.object({
    id: z.string(),
    credits: z.number(),
    email: z.string().optional(),
    name: z.string().optional(),
    projects: z.array(
      z.object({
        namespace: z.string(),
        index_name: z.string(),
        cost: z.number(),
        files: z.array(
          z.object({
            blob_name: z.string(),
            price: z.number(),
            credits: z.number(),
            num_pages: z.number(),
            file_name: z.string(),
            num_paragraphs: z.number().optional(),
            uploaded_date: z.string().optional()
          })
        ),
      })
    ),
  });
  
  export type UserSchema = z.infer<typeof userSchema>;