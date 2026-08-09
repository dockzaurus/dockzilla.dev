/**
 * Translation access.
 *
 * Dictionaries are plain typed objects rather than string-key lookups, so
 * `t.landing.hero.title` is checked by the compiler, autocompletes, and costs
 * nothing at runtime. `src/i18n/locales/en.ts` defines the canonical shape;
 * every other locale must satisfy it or the build fails.
 */

import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, type Locale } from './config';
import { en } from './locales/en';
import { fr } from './locales/fr';

export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

/** Returns the dictionary for a locale. */
export function useTranslations(locale: Locale): Dictionary {
	return DICTIONARIES[locale];
}

/**
 * Reads the active locale off the request URL.
 *
 * Prefer `Astro.currentLocale`; this is the fallback for contexts where Astro's
 * value is undefined (e.g. the default locale on an unprefixed route).
 */
export function getLocaleFromUrl(url: URL): Locale {
	const [, maybeLocale] = url.pathname.split('/');
	return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/** Normalises whatever Astro reports into a known locale. */
export function resolveLocale(currentLocale: string | undefined, url: URL): Locale {
	return isLocale(currentLocale) ? currentLocale : getLocaleFromUrl(url);
}

/**
 * Prefixes an app-absolute path with the locale segment.
 * The default locale is served unprefixed (`prefixDefaultLocale: false`).
 */
export function localizePath(path: string, locale: Locale): string {
	const normalized = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
	if (locale === DEFAULT_LOCALE) return normalized;
	return normalized === '/' ? `/${locale}/` : `/${locale}${normalized}`;
}

/** Strips the locale prefix from a pathname, yielding the locale-agnostic route. */
export function stripLocale(pathname: string): string {
	const [, maybeLocale, ...rest] = pathname.split('/');
	if (!isLocale(maybeLocale)) return pathname;
	const remainder = rest.join('/');
	return remainder ? `/${remainder}` : '/';
}

export type AlternateLink = {
	locale: Locale;
	hreflang: string;
	href: string;
	nativeName: string;
	short: string;
	isCurrent: boolean;
};

/**
 * Every locale variant of the current route, for `<link rel="alternate">` tags
 * and the locale switcher.
 */
export function getAlternateLinks(url: URL, site: URL | undefined, current: Locale): AlternateLink[] {
	const route = stripLocale(url.pathname);
	return LOCALES.map((locale) => {
		const path = localizePath(route, locale);
		return {
			locale,
			hreflang: LOCALE_META[locale].htmlLang,
			href: site ? new URL(path, site).href : path,
			nativeName: LOCALE_META[locale].nativeName,
			short: LOCALE_META[locale].short,
			isCurrent: locale === current,
		};
	});
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale };
export type { Locale };
