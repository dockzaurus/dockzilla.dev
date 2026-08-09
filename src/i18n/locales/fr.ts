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
		title: 'Dockzilla — Le PaaS auto-hébergé open source',
		description:
			'Dockzilla est un PaaS auto-hébergé open source : déploiements pilotés par Git, bases de données en un clic, TLS automatique et logs en direct sur vos serveurs.',
		ogDescription:
			'Git push, une URL. Le PaaS auto-hébergé open source : bases en un clic, TLS automatique et logs en direct, sur vos propres serveurs.',
		imageAlt:
			'Dockzilla — le PaaS auto-hébergé open source pour déployer par Git sur vos propres serveurs.',
	},

	nav: {
		features: 'Fonctionnalités',
		docs: 'Documentation',
	},

	notFound: {
		meta: {
			title: 'Page introuvable — Dockzilla',
			description: 'Cette page n\'existe pas. Revenez à l\'accueil ou filez directement dans la documentation.',
		},
		title: 'Cette route n\'a jamais été déployée',
		body: 'La page demandée est introuvable — elle a peut-être été déplacée, ou le lien est erroné. Vos serveurs, eux, vont bien.',
		home: 'Retour à l\'accueil',
		docs: 'Lire la documentation',
	},

	landing: {
		badge: 'Open source · auto-hébergé · à vous pour toujours',
		titleLead: 'Déployez vos applications sur',
		titleHighlight: 'vos propres serveurs',
		subtitle:
			'Dockzilla est un PaaS auto-hébergé open source qui offre une expérience de déploiement digne de Vercel sur le matériel que vous possédez déjà. Git push, une URL, et la facture reste chez vous.',
		ctaPrimary: 'Déployer votre première app',
		ctaSecondary: 'Lire la documentation',

		preview: {
			label:
				'Le tableau de bord Dockzilla : un graphique de trafic en direct à côté de trois projets déployés et de leur utilisation CPU.',
			trafficTitle: 'Trafic',
			requests: 'Requêtes',
			errors: 'Erreurs',
			cpu: 'CPU',
		},

		featuresTitle: 'Tout ce qu\'une plateforme d\'auto-hébergement exige — déjà construit',
		features: {
			git: {
				title: 'Déploiements pilotés par Git',
				body: 'Poussez une branche, obtenez une URL de preview. Bascule des conteneurs sans coupure.',
			},
			db: {
				title: 'Bases de données en un clic',
				body: 'Postgres, MySQL, Redis et MongoDB auto-hébergés, sauvegardes planifiées incluses.',
			},
			domains: {
				title: 'Domaines & TLS automatique',
				body: 'Certificats émis et renouvelés pour vous, wildcard et vérification DNS instantanée.',
			},
			logs: {
				title: 'Logs & métriques en direct',
				body: 'Streamez la sortie, tracez les requêtes, surveillez le CPU — sans APM externe.',
			},
			templates: {
				title: 'Templates auto-hébergeables',
				body: 'Plus de quatre-vingt-dix applications déployables sur votre serveur en un clic.',
			},
			team: {
				title: 'Équipes, rôles & SSO',
				body: 'Permissions fines, journal d\'audit et authentification unique pour toute l\'équipe.',
			},
		},

		ctaTitle: 'Vos serveurs. Vos données. Vos règles.',
		ctaBody:
			'Lancez-vous dans l\'auto-hébergement : ouvrez la console et migrez votre première charge en moins de dix minutes.',
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
