import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

import { LOCALES } from '@/i18n/config';

/**
 * Blog collection, ready for the posts that come next.
 *
 * Posts live at `src/content/blog/<locale>/<slug>.md`, so the locale is part of
 * the id (`en/hello-world`). A `[...slug]` route under each locale can filter on
 * it, and translations of one article share a `slug` across locale folders.
 */
const blog = defineCollection({
	loader: glob({ pattern: `**/*.{md,mdx}`, base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().max(120),
			description: z.string().max(300),
			publishedAt: z.coerce.date(),
			updatedAt: z.coerce.date().optional(),
			author: z.string(),
			tags: z.array(z.string()).default([]),
			cover: image().optional(),
			coverAlt: z.string().optional(),
			/** Hidden from listings and marked `noindex` until published. */
			draft: z.boolean().default(false),
			lang: z.enum(LOCALES),
		}),
});

export const collections = { blog };
