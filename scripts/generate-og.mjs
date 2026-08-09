/**
 * Regenerates the raster brand assets: the Open Graph cards in `public/og/` (one
 * per locale), plus the square logo that `Organization.logo` and the Apple touch
 * icon both need — neither accepts the SVG favicon.
 *
 * These are committed static assets, so this script only needs running when the
 * brand or the card copy changes: `node scripts/generate-og.mjs`.
 *
 * It borrows the `sharp` that Astro's image pipeline already installs rather
 * than adding a dependency of its own — see `resolveSharp` below.
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public/og');

const WIDTH = 1200;
const HEIGHT = 630;

/** sRGB equivalents of the light-theme oklch tokens in `src/styles/global.css`. */
const COLOR = {
	background: '#f8f9ee',
	card: '#fdfef9',
	ink: '#0f1f14',
	primary: '#00a24f',
	primaryGlow: '#6be774',
	primaryForeground: '#061009',
	muted: '#5d6e60',
	border: '#ced8cb',
};

/**
 * Space Grotesk only ships as woff2 here, which librsvg cannot load, so the card
 * falls back to the closest system grotesque. Keep it a stack, not one family.
 */
const DISPLAY = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'SF Mono, Menlo, Consolas, monospace';

/** Card copy per locale. Mirrors `src/i18n/locales/<code>.ts`, condensed to fit. */
const CARDS = {
	en: {
		headline: ['Deploy your apps on', 'your own servers'],
		headlineSize: 76,
		subline: 'Git-driven deploys · One-click databases · Automatic TLS · Live logs',
		sublineSize: 26,
		badge: 'Open source · Self-hosted · Apache 2.0',
	},
	fr: {
		headline: ['Déployez vos applications', 'sur vos propres serveurs'],
		headlineSize: 64,
		subline: 'Déploiements par Git · Bases en un clic · TLS automatique · Logs en direct',
		sublineSize: 24,
		badge: 'Open source · Auto-hébergé · Apache 2.0',
	},
};

const escape = (value) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Rough advance-width estimate — enough to size the badge pill around its label. */
const textWidth = (text, size, weight = 700) => text.length * size * (weight >= 700 ? 0.55 : 0.5);

function buildSvg({ headline, headlineSize, subline, sublineSize, badge }) {
	const badgeWidth = textWidth(badge, 24) + 56;
	const [lineOne, lineTwo] = headline;
	const secondBaseline = 280 + headlineSize * 1.12;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
	<defs>
		<linearGradient id="brand" x1="0" y1="0" x2="1" y2="0.3">
			<stop offset="0" stop-color="${COLOR.primary}"/>
			<stop offset="1" stop-color="${COLOR.primaryGlow}"/>
		</linearGradient>
		<radialGradient id="glow" cx="0.78" cy="0.02" r="0.85">
			<stop offset="0" stop-color="${COLOR.primaryGlow}" stop-opacity="0.5"/>
			<stop offset="0.65" stop-color="${COLOR.primaryGlow}" stop-opacity="0"/>
		</radialGradient>
		<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M40 0 H0 V40" fill="none" stroke="${COLOR.border}" stroke-width="1"/>
		</pattern>
	</defs>

	<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.background}"/>
	<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" opacity="0.75"/>
	<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

	<g>
		<rect x="88" y="76" width="64" height="64" rx="14" fill="${COLOR.primary}" stroke="${COLOR.ink}" stroke-width="3"/>
		<rect x="108" y="96" width="24" height="24" rx="5" fill="${COLOR.primaryForeground}"/>
		<text x="172" y="123" font-family="${DISPLAY}" font-size="42" font-weight="700" letter-spacing="-1" fill="${COLOR.ink}">Dockzilla</text>
	</g>

	<text x="88" y="280" font-family="${DISPLAY}" font-size="${headlineSize}" font-weight="700" letter-spacing="-2.5" fill="${COLOR.ink}">${escape(lineOne)}</text>
	<text x="88" y="${secondBaseline}" font-family="${DISPLAY}" font-size="${headlineSize}" font-weight="700" letter-spacing="-2.5" fill="url(#brand)">${escape(lineTwo)}</text>

	<text x="88" y="${secondBaseline + 66}" font-family="${DISPLAY}" font-size="${sublineSize}" font-weight="500" fill="${COLOR.muted}">${escape(subline)}</text>

	<g>
		<rect x="88" y="${secondBaseline + 100}" width="${badgeWidth}" height="52" rx="26" fill="${COLOR.card}" stroke="${COLOR.ink}" stroke-width="3"/>
		<circle cx="${88 + 30}" cy="${secondBaseline + 126}" r="6" fill="${COLOR.primary}"/>
		<text x="${88 + 48}" y="${secondBaseline + 134}" font-family="${DISPLAY}" font-size="23" font-weight="700" fill="${COLOR.ink}">${escape(badge)}</text>
	</g>

	<text x="${WIDTH - 88}" y="${HEIGHT - 56}" text-anchor="end" font-family="${MONO}" font-size="26" fill="${COLOR.muted}">dockzilla.dev</text>

	<rect x="8" y="8" width="${WIDTH - 16}" height="${HEIGHT - 16}" fill="none" stroke="${COLOR.ink}" stroke-width="16"/>
</svg>`;
}

/** The bare mark on the brand background, square — the shape icons and rich results want. */
function buildLogoSvg(size) {
	const inset = size * 0.14;
	const box = size - inset * 2;
	const dot = box * 0.375;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
	<rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${COLOR.background}"/>
	<rect x="${inset}" y="${inset}" width="${box}" height="${box}" rx="${box * 0.2}" fill="${COLOR.primary}" stroke="${COLOR.ink}" stroke-width="${size * 0.035}"/>
	<rect x="${(size - dot) / 2}" y="${(size - dot) / 2}" width="${dot}" height="${dot}" rx="${dot * 0.2}" fill="${COLOR.primaryForeground}"/>
</svg>`;
}

/** Astro depends on sharp for image optimisation; reuse it instead of adding a devDependency. */
function resolveSharp() {
	const require = createRequire(import.meta.url);
	const astroEntry = require.resolve('astro/package.json', { paths: [ROOT] });
	const fromAstro = createRequire(astroEntry);
	return require(fromAstro.resolve('sharp'));
}

const sharp = resolveSharp();
await mkdir(OUT_DIR, { recursive: true });

const toPng = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

for (const [locale, card] of Object.entries(CARDS)) {
	const png = await toPng(buildSvg(card));
	await writeFile(resolve(OUT_DIR, `${locale}.png`), png);
	console.log(`public/og/${locale}.png — ${(png.length / 1024).toFixed(1)} kB`);
}

for (const [name, size] of [
	['logo-512.png', 512],
	['apple-touch-icon.png', 180],
]) {
	const png = await toPng(buildLogoSvg(size));
	await writeFile(resolve(ROOT, 'public', name), png);
	console.log(`public/${name} — ${(png.length / 1024).toFixed(1)} kB`);
}
