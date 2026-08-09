import type { Dictionary } from '@/i18n';

export const fr: Dictionary = {
	common: {
		tagline: 'L\'auto-hébergement, sans la corvée',
		docs: 'Documentation',
		signIn: 'Se connecter',
		getStarted: 'Commencer gratuitement',
		github: 'Étoiler sur GitHub',
		skipToContent: 'Aller au contenu',
		toggleTheme: 'Basculer le thème de couleur',
		language: 'Langue',
	},

	status: {
		running: 'En ligne',
		building: 'Build en cours',
		degraded: 'Dégradé',
	},

	meta: {
		title: 'Dockzilla — Déploiements dignes de Vercel sur vos propres serveurs',
		description:
			'Dockzilla est une plateforme d\'auto-hébergement open source : déploiements pilotés par Git, bases en un clic, TLS automatique et journaux en direct sur le matériel que vous contrôlez.',
		ogDescription:
			'Déploiements pilotés par Git, bases en un clic, TLS automatique et journaux en direct sur le matériel que vous contrôlez.',
	},

	nav: {
		features: 'Fonctionnalités',
		docs: 'Documentation',
	},

	landing: {
		badge: 'Open source · auto-hébergé · à vous pour toujours',
		titleLead: 'Déployez vos applications sur',
		titleHighlight: 'vos propres serveurs',
		subtitle:
			'Dockzilla offre une expérience de déploiement digne de Vercel sur le matériel que vous contrôlez. Git push, une URL, et la facture reste chez vous.',
		ctaPrimary: 'Déployer votre première app',
		ctaSecondary: 'Lire la documentation',

		preview: {
			label: 'Aperçu du produit',
			trafficTitle: 'Trafic',
			requests: 'Requêtes',
			errors: 'Erreurs',
			cpu: 'CPU',
		},

		featuresTitle: 'Tout ce qu\'une équipe plateforme construit — déjà construit',
		features: {
			git: {
				title: 'Déploiements par Git',
				body: 'Poussez une branche, obtenez une URL de preview. Bascule sans coupure.',
			},
			db: {
				title: 'Bases en un clic',
				body: 'Postgres, MySQL, Redis et Mongo, sauvegardes planifiées incluses.',
			},
			domains: {
				title: 'Domaines & TLS',
				body: 'Certificats automatiques, wildcard et vérification DNS instantanée.',
			},
			logs: {
				title: 'Logs & métriques en direct',
				body: 'Streamez la sortie, tracez les requêtes, surveillez le CPU.',
			},
			templates: {
				title: 'Marketplace de templates',
				body: 'Plus de quatre-vingt-dix applications déployables en un clic.',
			},
			team: {
				title: 'Équipes & rôles',
				body: 'Permissions fines, journal d\'audit et SSO pour toute l\'équipe.',
			},
		},

		ctaTitle: 'Vos serveurs. Vos données. Vos règles.',
		ctaBody: 'Lancez la console et migrez votre première charge en moins de dix minutes.',
	},

	footer: {
		rights: 'Open source sous licence Apache 2.0.',
		sections: {
			product: 'Produit',
			resources: 'Ressources',
			community: 'Communauté',
		},
		links: {
			features: 'Fonctionnalités',
			docs: 'Documentation',
			blog: 'Blog',
			github: 'GitHub',
			discord: 'Discord',
		},
	},
};
