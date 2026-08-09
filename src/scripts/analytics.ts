import { capture, initAnalytics, isEnabled } from '@/lib/analytics';
import type { EventMap } from '@/lib/analytics';

/**
 * Client entry point for analytics.
 *
 * Alongside booting the SDK, this wires the declarative tracking attribute so
 * markup can record an event without any per-component script:
 *
 *   <a data-track="cta_clicked" data-track-location="hero" href="…">
 *
 * `data-track` is the event name; every `data-track-*` attribute after it
 * becomes a property. Anything not listed in `EventMap` is ignored.
 */

initAnalytics();

if (isEnabled()) {
	document.addEventListener(
		'click',
		(event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;

			const trigger = target.closest<HTMLElement>('[data-track]');
			const name = trigger?.dataset.track as keyof EventMap | undefined;
			if (!trigger || !name) return;

			const properties: Record<string, string> = {};
			for (const [key, value] of Object.entries(trigger.dataset)) {
				if (key === 'track' || !key.startsWith('track') || value === undefined) continue;
				// `trackLocation` -> `location`
				const property = key.slice('track'.length);
				properties[property.charAt(0).toLowerCase() + property.slice(1)] = value;
			}

			if (trigger instanceof HTMLAnchorElement && !properties.href) {
				properties.href = trigger.href;
			}

			capture(name, properties as EventMap[typeof name]);
		},
		{ passive: true },
	);
}
