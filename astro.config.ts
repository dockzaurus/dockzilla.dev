// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

import { DEFAULT_LOCALE, LOCALES } from './src/i18n/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://dockzilla.dev',

	// English is served from `/`, every other locale from `/<code>/`.
	i18n: {
		locales: [...LOCALES],
		defaultLocale: DEFAULT_LOCALE,
		routing: {
			prefixDefaultLocale: false,
			redirectToDefaultLocale: false,
		},
	},

	/**
	 * Analytics is opt-in: with no key set, `src/lib/analytics.ts` stays a no-op
	 * and posthog-js is never downloaded. See `.env.example`.
	 */
	env: {
		schema: {
			PUBLIC_POSTHOG_KEY: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
			}),
			PUBLIC_POSTHOG_HOST: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
				// EU cloud by default — this is an EU project and it keeps data in-region.
				default: 'https://eu.i.posthog.com',
			}),
		},
	},

	// Self-hosted, subsetted and preloaded by Astro. The CSS variables declared
	// here are consumed by the `@theme` block in `src/styles/global.css`.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-space-grotesk',
			weights: [500, 700],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'DM Sans',
			cssVariable: '--font-dm-sans',
			weights: [400, 500, 600],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains-mono',
			weights: [400, 500],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
		},
	],

	integrations: [
		// Icons are inlined as SVG at build time — no client-side icon runtime.
		icon({
			include: {
				lucide: [
					'arrow-left',
					'arrow-right',
					'boxes',
					'database',
					'globe',
					'scroll-text',
					'layout-template',
					'users',
					'sun',
					'moon',
					'github',
					'keyboard',
					'x',
				],
			},
		}),
		// Emits `<xhtml:link rel="alternate">` entries per locale automatically.
		sitemap({
			i18n: {
				defaultLocale: DEFAULT_LOCALE,
				locales: Object.fromEntries(LOCALES.map((locale) => [locale, locale])),
			},
		}),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
