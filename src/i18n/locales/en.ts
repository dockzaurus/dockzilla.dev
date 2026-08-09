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

	/**
	 * Search-facing copy. `title` stays under ~60 characters and `description`
	 * under ~155 so neither is truncated in a result page; `ogDescription` is the
	 * shorter, punchier variant social cards get.
	 */
	meta: {
		title: 'Dockzilla — Open-source self-hosted PaaS for your servers',
		description:
			'Dockzilla is an open-source self-hosted PaaS: git-driven deploys, one-click databases, automatic TLS and live logs — on servers you own. Free forever.',
		ogDescription:
			'Git push, get a URL. The open-source self-hosted PaaS: one-click databases, automatic TLS and live logs on servers you own.',
		imageAlt: 'Dockzilla — the open-source self-hosted PaaS for git-driven deploys on your own servers.',
	},

	nav: {
		features: 'Features',
		docs: 'Docs',
	},

	landing: {
		badge: 'Open source · self-hosted · yours forever',
		titleLead: 'Deploy your apps on',
		titleHighlight: 'your own servers',
		subtitle:
			'Dockzilla is an open-source, self-hosted PaaS that gives you a Vercel-grade deploy experience on hardware you already own. Git push, get a URL, keep the bill.',
		ctaPrimary: 'Deploy your first app',
		ctaSecondary: 'Read the docs',

		preview: {
			label: 'The Dockzilla dashboard: a live traffic chart beside three deployed projects and their CPU usage.',
			trafficTitle: 'Traffic',
			requests: 'Requests',
			errors: 'Errors',
			cpu: 'CPU',
		},

		featuresTitle: 'Everything a self-hosting platform needs — already built',
		features: {
			git: {
				title: 'Git-driven deploys',
				body: 'Push to a branch, get a preview URL. Zero-downtime container swaps by default.',
			},
			db: {
				title: 'One-click databases',
				body: 'Self-hosted Postgres, MySQL, Redis and MongoDB with scheduled backups baked in.',
			},
			domains: {
				title: 'Custom domains & automatic TLS',
				body: 'Certificates issued and renewed for you, wildcard support and instant DNS checks.',
			},
			logs: {
				title: 'Live logs & metrics',
				body: 'Stream stdout, trace requests and watch CPU in real time — no external APM needed.',
			},
			templates: {
				title: 'Self-hosted app templates',
				body: 'Ninety-plus self-hostable apps, each deployable to your server in a single click.',
			},
			team: {
				title: 'Teams, roles & SSO',
				body: 'Granular permissions, audit trails and single sign-on for the whole crew.',
			},
		} satisfies Record<FeatureId, { title: string; body: string }>,

		ctaTitle: 'Your servers. Your data. Your rules.',
		ctaBody: 'Start self-hosting today — spin up the dashboard and move your first workload in under ten minutes.',
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
