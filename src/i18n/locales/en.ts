import type { FeatureId, ProjectStatus } from '@/data/landing';

/**
 * Canonical dictionary. Its shape becomes the `Dictionary` type, so every other
 * locale is compile-time checked against this file — a missing key is a build
 * error, not a runtime fallback.
 */
export const en = {
	common: {
		tagline: 'Self-hosting, without the yak shaving',
		docs: 'Docs',
		signIn: 'Sign in',
		getStarted: 'Get started free',
		github: 'Star on GitHub',
		skipToContent: 'Skip to content',
		toggleTheme: 'Toggle colour theme',
		language: 'Language',
	},

	status: {
		running: 'Running',
		building: 'Building',
		degraded: 'Degraded',
	} satisfies Record<ProjectStatus, string>,

	meta: {
		title: 'Dockzilla — Vercel-grade deploys on your own servers',
		description:
			'Dockzilla is an open-source self-hosting platform: git-driven deploys, one-click databases, automatic TLS and live logs on hardware you control.',
		ogDescription:
			'Git-driven deploys, one-click databases, automatic TLS and live logs on hardware you control.',
	},

	nav: {
		features: 'Features',
		docs: 'Docs',
	},

	landing: {
		badge: 'Open source · self-hosted · yours forever',
		titleLead: 'Ship your apps on',
		titleHighlight: 'your own servers',
		subtitle:
			'Dockzilla gives you a Vercel-grade deploy experience on hardware you control. Git push, get a URL, keep the bill.',
		ctaPrimary: 'Deploy your first app',
		ctaSecondary: 'Read the docs',

		preview: {
			label: 'Product preview',
			trafficTitle: 'Traffic',
			requests: 'Requests',
			errors: 'Errors',
			cpu: 'CPU',
		},

		featuresTitle: 'Everything a platform team builds — already built',
		features: {
			git: {
				title: 'Git-driven deploys',
				body: 'Push to a branch, get a preview URL. Zero-downtime swaps by default.',
			},
			db: {
				title: 'One-click databases',
				body: 'Postgres, MySQL, Redis and Mongo with scheduled backups baked in.',
			},
			domains: {
				title: 'Domains & TLS',
				body: 'Automatic certificates, wildcard support and instant DNS checks.',
			},
			logs: {
				title: 'Live logs & metrics',
				body: 'Stream stdout, trace requests and watch CPU in real time.',
			},
			templates: {
				title: 'Template marketplace',
				body: 'Ninety-plus self-hostable apps, deployable in a single click.',
			},
			team: {
				title: 'Teams & roles',
				body: 'Granular permissions, audit trails and SSO for the whole crew.',
			},
		} satisfies Record<FeatureId, { title: string; body: string }>,

		ctaTitle: 'Your servers. Your data. Your rules.',
		ctaBody: 'Spin up the dashboard and move your first workload in under ten minutes.',
	},

	footer: {
		rights: 'Open source under the Apache 2.0 licence.',
		sections: {
			product: 'Product',
			resources: 'Resources',
			community: 'Community',
		},
		links: {
			features: 'Features',
			docs: 'Documentation',
			blog: 'Blog',
			github: 'GitHub',
			discord: 'Discord',
		},
	},
};
