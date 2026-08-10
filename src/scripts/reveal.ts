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
 *   `data-reveal-delay="240"`    delay in ms — on a group, holds the whole run
 *                                back; on a child of one, ignored
 *   `data-reveal-distance="40"`  rise distance in px (default 20)
 *   `data-usage-fill`            grow to the width its `--usage-value` declares
 *   `data-chart`                 draw the chart inside: grid, then sweep
 *
 * Under `prefers-reduced-motion` this module does nothing and the CSS in
 * `global.css` leaves everything in its finished state.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.55;
const STAGGER = 0.07;
const VIEW_OPTIONS = { amount: 0.15 } as const;

/**
 * The chart draw. Softer than `EASE`, which is an expo-out: over a sweep this
 * long that would cross the plot in the first third and then crawl. This one
 * leads gently and settles, which reads as a line being drawn.
 */
const DRAW_EASE = [0.25, 0.4, 0.25, 1] as const;
/**
 * Grid first, then the series drawn over it. Both wait for the panel around
 * the chart to have landed — it enters on the same scroll, and a chart drawing
 * itself behind a half-faded surface reads as a glitch rather than a sequence.
 */
const GRID_DELAY = 0.5;
const SWEEP_DELAY = 0.65;
const SWEEP_DURATION = 1.1;

const distanceOf = (el: HTMLElement) => Number(el.dataset.revealDistance ?? 20);
const delayOf = (el: HTMLElement) => Number(el.dataset.revealDelay ?? 0) / 1000;

/**
 * The rise, spelled out as a `transform`.
 *
 * `motion/mini` hands keyframe names straight to WAAPI — it has none of the
 * full build's shorthands, so `y: [20, 0]` animates a CSS property named `y`,
 * which does nothing to an HTML box. Tailwind v4 writes its own rotate and
 * translate utilities to the *individual* properties (`rotate:`, `translate:`),
 * so taking over `transform` here collides with nothing.
 */
const rise = (distance: number) => [`translateY(${distance}px)`, 'translateY(0px)'];

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
type RevealAttribute = 'data-reveal' | 'data-usage-fill' | 'data-chart-grid' | 'data-chart-wipe' | 'data-chart-dot';

const settle = (elements: Element[], attribute: RevealAttribute) => {
	for (const el of elements) el.setAttribute(attribute, 'in');
};

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
	// Grouped children rise together, offset by `stagger`. A delay on the group
	// itself holds the whole run back — the children's own are ignored, since
	// what makes a group a group is that one clock drives it.
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
				{ opacity: [0, 1], transform: rise(distanceOf(first)) },
				{ duration: DURATION, ease: EASE, delay: stagger(STAGGER, { startDelay: delayOf(group as HTMLElement) }) },
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
				{ opacity: [0, 1], transform: rise(distanceOf(el)) },
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

			void animate(
				element as HTMLElement,
				{ width: ['0%', target] },
				{ duration: 0.9, ease: EASE, delay: delayOf(element as HTMLElement) },
			).then(() => settle([element], 'data-usage-fill'));
		},
		VIEW_OPTIONS,
	);

	/**
	 * Charts draw themselves: the grid fades up first, then a clip rect sweeps
	 * the series in from the left while a marker rides the request line to its
	 * last reading.
	 *
	 * The sweep and the marker share a duration and an easing so the marker
	 * tracks the leading edge. It can only ever trail it, never run ahead of it
	 * into blank plot: `offset-distance` advances by arc length while the clip
	 * advances by width, and a curve is always at least as long as its span.
	 */
	inView(
		'[data-chart]',
		(chart) => {
			if (!claim(chart)) return;

			const grid = Array.from(chart.querySelectorAll<SVGElement>('[data-chart-grid]'));
			if (grid.length) {
				void animate(
					grid,
					{ opacity: [0, 1] },
					{ duration: 0.4, ease: EASE, delay: stagger(0.03, { startDelay: GRID_DELAY }) },
				).then(() => settle(grid, 'data-chart-grid'));
			}

			const wipe = chart.querySelector<SVGElement>('[data-chart-wipe]');
			if (wipe) {
				void animate(
					wipe,
					{ transform: ['scaleX(0)', 'scaleX(1)'] },
					{ duration: SWEEP_DURATION, ease: DRAW_EASE, delay: SWEEP_DELAY },
				).then(() => settle([wipe], 'data-chart-wipe'));
			}

			// Without `offset-path` the marker has no path to follow and would
			// animate in at the origin, so leave it hidden instead.
			const dot = chart.querySelector<SVGElement>('[data-chart-dot]');
			if (dot && CSS.supports('offset-path', 'path("M0,0")')) {
				void animate(
					dot,
					{ opacity: [0, 1], offsetDistance: ['0%', '100%'] },
					{
						duration: SWEEP_DURATION,
						ease: DRAW_EASE,
						delay: SWEEP_DELAY,
						opacity: { duration: 0.25, ease: 'linear' },
					},
				).then(() => settle([dot], 'data-chart-dot'));
			}
		},
		VIEW_OPTIONS,
	);
}
