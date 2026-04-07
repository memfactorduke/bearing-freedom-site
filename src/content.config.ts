import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    youtube_url: z.string().url(),
    youtube_id: z.string(),
    thumbnail: z.string(),
    duration: z.string(),
    author: z.string().default('Bearing Freedom'),
    topics: z.array(z.string()).default([]),
    states: z.array(z.string()).default([]),
    content_type: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    image_prompt: z.string().optional(),
  }),
});

export const collections = { articles };
