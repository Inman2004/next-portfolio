import * as z from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().nullable().optional(),
  published: z.boolean().default(true),
  tags: z.string().optional(),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
