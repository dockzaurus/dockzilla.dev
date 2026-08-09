import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from 'astro:env/client';

/**
 * Analytics facade.
 *
 * Nothing outside this file imports `posthog-js`. Call sites use `capture()`
 * with a typed event name, which means the vendor can be swapped, wrapped or
 * dropped without touching feature code, and the full list of events the site
 * emits is readable in one place (`EventMap` below).
 *
 * Three properties hold by construction:
 *   - With no `PUBLIC_POSTHOG_KEY`, every function here is a no-op and
 *     `posthog-js` is never downloaded — it is behind a dynamic import.
 *   - Calls made before the SDK finishes loading are queued, not lost.
 *   - Opt-out and Do Not Track are honoured before the SDK is even fetched.
 */

/** Every event the site can emit, with the shape of its properties. */
export type EventMap = {
	cta_clicked: { location: 'header' | 'hero' | 'final_cta' | 'footer'; href: string };
	docs_opened: { location: string };
	locale_switched: { from: string; to: string };
	theme_toggled: { theme: 'light' | 'dark' };
};

export type EventName = keyof EventMap;

type PostHog = import('posthog-js').PostHog;

const OPT_OUT_KEY = 'dockzilla.analytics.opt-out';

/** True when a key is configured at build time. Does not imply consent. */
export const isConfigured = Boolean(PUBLIC_POSTHOG_KEY);

const isBrowser = () => typeof window !== 'undefined';

function hasOptedOut(): boolean {
	try {
		if (localStorage.getItem(OPT_OUT_KEY) === '1') return true;
	} catch {
		/* storage blocked — fall through to the DNT check */
	}
	return navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes';
}

/** Whether events will actually be sent right now. */
export function isEnabled(): boolean {
	return isConfigured && isBrowser() && !hasOptedOut();
}

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const pending: Array<(posthog: PostHog) => void> = [];

/**
 * Loads and initialises posthog-js once. The dynamic import keeps the SDK in a
 * chunk of its own that is only requested when analytics is actually on.
 */
function load(): Promise<PostHog | null> {
	// Checked against the inlined constant rather than `isEnabled()` so that,
	// with no key configured, the bundler can see the `import()` below is
	// unreachable and drop posthog-js from the build entirely.
	if (!PUBLIC_POSTHOG_KEY) return Promise.resolve(null);
	if (!isEnabled()) return Promise.resolve(null);
	if (loading) return loading;

	loading = import('posthog-js')
		.then(({ default: posthog }) => {
			posthog.init(PUBLIC_POSTHOG_KEY as string, {
				api_host: PUBLIC_POSTHOG_HOST,
				// Only create person profiles for users we explicitly identify —
				// anonymous marketing traffic stays aggregate.
				person_profiles: 'identified_only',
				// Each Astro navigation is a real page load, so the default is correct.
				capture_pageview: true,
				// Explicit events only; flip on if you want blanket click tracking.
				autocapture: false,
			});

			client = posthog;
			for (const run of pending.splice(0)) run(posthog);
			return posthog;
		})
		.catch(() => {
			// A blocked or failed SDK must never break the page.
			loading = null;
			return null;
		});

	return loading;
}

/** Runs `action` against the SDK, loading it first and queueing if necessary. */
function withClient(action: (posthog: PostHog) => void): void {
	if (!isEnabled()) return;
	if (client) {
		action(client);
		return;
	}
	pending.push(action);
	void load();
}

/** Records an event. Unknown names and wrong property shapes are type errors. */
export function capture<K extends EventName>(name: K, properties: EventMap[K]): void {
	withClient((posthog) => posthog.capture(name, properties));
}

/** Associates subsequent events with a known user. */
export function identify(distinctId: string, properties?: Record<string, unknown>): void {
	withClient((posthog) => posthog.identify(distinctId, properties));
}

/** Clears the current identity — call on sign-out. */
export function reset(): void {
	withClient((posthog) => posthog.reset());
}

/** Starts analytics for this visitor. Safe to call before the SDK has loaded. */
export function optIn(): void {
	try {
		localStorage.removeItem(OPT_OUT_KEY);
	} catch {
		/* storage blocked — the choice just won't survive a reload */
	}
	void load();
}

/** Stops analytics and remembers the choice. */
export function optOut(): void {
	try {
		localStorage.setItem(OPT_OUT_KEY, '1');
	} catch {
		/* storage blocked — the choice just won't survive a reload */
	}
	client?.opt_out_capturing();
	client = null;
}

/** Boots analytics if it is configured and permitted. Called once, from BaseLayout. */
export function initAnalytics(): void {
	if (!isEnabled()) return;
	void load();
}
