// `animate` comes from `motion/mini` on purpose: it is the WAAPI-backed build,
// ~4KB gzipped against ~22KB for the full JS-driven one, and it covers
// everything here (element keyframes, stagger). Switch to `motion` only if you
// need springs or value animations — `animate(0, 100, { onUpdate })` — which
// mini does not implement. `inView` and `stagger` are tree-shaken helpers and
// pull in no animation engine of their own.
import { animate } from 'motion/mini';
import { inView, stagger } from 'motion';

/**
 * Entrance animations, driven by Motion.
 *
 * Components stay declarative — they only add attributes:
 *   `data-reveal`                fade + rise when scrolled into view
 *   `data-reveal-group`          stagger this container's direct reveal children
 *   `data-reveal-delay="240"`    delay in ms (ignored inside a group)
 *   `data-reveal-distance="40"`  rise distance in px (default 20)
 *   `data-usage-fill`            grow to the width its `--usage-value` declares
 *
 * Under `prefers-reduced-motion` this module does nothing and the CSS in
 * `global.css` leaves everything in its finished state.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.55;
const STAGGER = 0.07;
const VIEW_OPTIONS = { amount: 0.15 } as const;

const distanceOf = (el: HTMLElement) => Number(el.dataset.revealDistance ?? 20);
const delayOf = (el: HTMLElement) => Number(el.dataset.revealDelay ?? 0) / 1000;

/**
 * Motion's `inView` fires on every entry, not just the first, so each element
 * is claimed once. Without this, scrolling back up replays the animation.
 */
const claimed = new WeakSet<Element>();
const claim = (el: Element) => (claimed.has(el) ? false : (claimed.add(el), true));

/**
 * Pins the finished state via an attribute the stylesheet keys off, so a
 * revealed element never depends on the inline styles Motion leaves behind.
 */
const settle = (elements: Element[], attribute: 'data-reveal' | 'data-usage-fill') => {
	for (const el of elements) el.setAttribute(attribute, 'in');
};

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
	// Grouped children rise together, offset by `stagger`.
	inView(
		'[data-reveal-group]',
		(group) => {
			if (!claim(group)) return;

			const items = Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-reveal]'));
			const first = items[0];
			if (!first) return;
			items.forEach(claim);

			void animate(
				items,
				{ opacity: [0, 1], y: [distanceOf(first), 0] },
				{ duration: DURATION, ease: EASE, delay: stagger(STAGGER) },
			).then(() => settle(items, 'data-reveal'));
		},
		VIEW_OPTIONS,
	);

	// Everything not owned by a group animates on its own schedule.
	inView(
		'[data-reveal]:not([data-reveal-group] > [data-reveal])',
		(element) => {
			if (!claim(element)) return;

			const el = element as HTMLElement;
			void animate(
				el,
				{ opacity: [0, 1], y: [distanceOf(el), 0] },
				{ duration: DURATION, ease: EASE, delay: delayOf(el) },
			).then(() => settle([el], 'data-reveal'));
		},
		VIEW_OPTIONS,
	);

	// Usage bars fill to the width their inline `--usage-value` declares.
	inView(
		'[data-usage-fill]',
		(element) => {
			if (!claim(element)) return;

			const target = getComputedStyle(element).getPropertyValue('--usage-value').trim();
			if (!target) return;

			void animate(element as HTMLElement, { width: ['0%', target] }, { duration: 0.9, ease: EASE }).then(() =>
				settle([element], 'data-usage-fill'),
			);
		},
		VIEW_OPTIONS,
	);
}
