/**
 * Structure and figures for the landing page.
 *
 * Deliberately split from `src/i18n/locales/*`: this file owns *what* is shown
 * and in which order (ids, icons, numbers), the dictionaries own *the words*.
 * The exported id unions are what force every locale to translate every item.
 */

export const FEATURE_IDS = ['git', 'db', 'domains', 'logs', 'templates', 'team'] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

/** `lucide:*` icon names — keep in sync with the `icon()` include list in astro.config.ts. */
export const FEATURE_ICONS: Record<FeatureId, string> = {
	git: 'lucide:boxes',
	db: 'lucide:database',
	domains: 'lucide:globe',
	logs: 'lucide:scroll-text',
	templates: 'lucide:layout-template',
	team: 'lucide:users',
};

export type ProjectStatus = 'running' | 'building' | 'degraded';

export type PreviewProject = {
	name: string;
	status: ProjectStatus;
	cpu: number;
};

/** Illustrative dashboard content rendered inside the hero product shot. */
export const PREVIEW_PROJECTS: readonly PreviewProject[] = [
	{ name: 'atlas-web', status: 'running', cpu: 34 },
	{ name: 'billing-api', status: 'building', cpu: 71 },
	{ name: 'docs-site', status: 'running', cpu: 9 },
];

export type TrafficPoint = { t: string; requests: number; errors: number };

export const TRAFFIC_SERIES: readonly TrafficPoint[] = [
	{ t: '00:00', requests: 8200, errors: 24 },
	{ t: '02:00', requests: 6100, errors: 12 },
	{ t: '04:00', requests: 5400, errors: 9 },
	{ t: '06:00', requests: 9800, errors: 31 },
	{ t: '08:00', requests: 18400, errors: 44 },
	{ t: '10:00', requests: 24100, errors: 38 },
	{ t: '12:00', requests: 27600, errors: 51 },
	{ t: '14:00', requests: 25900, errors: 29 },
	{ t: '16:00', requests: 30200, errors: 62 },
	{ t: '18:00', requests: 28700, errors: 40 },
	{ t: '20:00', requests: 21300, errors: 22 },
	{ t: '22:00', requests: 13800, errors: 15 },
];
