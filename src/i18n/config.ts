/**
 * Locale registry — the single source of truth shared by `astro.config.ts`
 * (routing) and the runtime translation helpers in `./index.ts`.
 *
 * Adding a language is a three-step change: add the code here, add its entry to
 * `LOCALE_META`, and add `src/i18n/locales/<code>.ts`. Routing, `hreflang`
 * links, the locale switcher and the sitemap all derive from this file.
 */

export const LOCALES = ['en', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

type LocaleMeta = {
	/** Name of the language, written in that language. */
	readonly nativeName: string;
	/** Two-letter label used by the compact locale switcher. */
	readonly short: string;
	/** `lang` attribute / BCP-47 tag. */
	readonly htmlLang: string;
	/** `og:locale` value. */
	readonly ogLocale: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
	en: { nativeName: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
	fr: { nativeName: 'Français', short: 'FR', htmlLang: 'fr', ogLocale: 'fr_FR' },
};

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && (LOCALES as readonly string[]).includes(value);
}
