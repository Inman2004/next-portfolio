import * as z from 'zod';

export const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300, 'Excerpt must be less than 300 characters'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().nullable().optional(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  slug: z.string().optional(),
  readingTime: z.string().optional(),
  viewCount: z.number().default(0),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  authorPhotoURL: z.string().optional().nullable(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export const blogPostFormSchema = blogPostSchema.pick({
  title: true,
  excerpt: true,
  content: true,
  coverImage: true,
  published: true,
  tags: true,
});

export type BlogPostFormInput = z.infer<typeof blogPostFormSchema>;
