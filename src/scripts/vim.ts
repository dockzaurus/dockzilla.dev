import { KEYMAP, type BindingId } from '@/data/keymap';
import { announce, format } from './announce';

/**
 * Vim-style keyboard navigation.
 *
 * `src/data/keymap.ts` declares the bindings, `src/i18n` describes them, and
 * this module is the only place that knows what they *do*. Components stay
 * declarative: a section opts in with `data-section`, a link becomes a jump
 * target with `data-goto="docs"`.
 *
 * Three rules keep single-key shortcuts from becoming an accessibility problem
 * of their own (WCAG 2.1.4, Character Key Shortcuts):
 *
 *   - Nothing fires while focus is in a field, a `contenteditable`, or a dialog.
 *   - Nothing fires alongside Ctrl/Alt/Cmd, so browser and AT chords are intact.
 *   - The whole layer can be switched off, and the choice is remembered.
 *
 * Every jump that moves the viewport without moving focus also moves focus, and
 * announces where it landed — a sighted keyboard user and a screen-reader user
 * end up in the same place.
 */

const STORAGE_KEY = 'dockzilla.keys';
/** How long a half-typed chord (`g` …) waits for its second key. */
const CHORD_TIMEOUT = 1200;
/** One `j`/`k` step, in px. Roughly three lines of body copy. */
const SCROLL_STEP = 96;
/** Home row first — the labels should be cheap to type without looking. */
const HINT_ALPHABET = 'fjdkslaghrueiwotyncmvbpqxz';

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'summary',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

type Strings = {
	enabled: string;
	disabled: string;
	top: string;
	bottom: string;
	section: string;
	hints: string;
	hintsEmpty: string;
};

const STRINGS: Strings = readStrings();

function readStrings(): Strings {
	const empty: Strings = { enabled: '', disabled: '', top: '', bottom: '', section: '', hints: '', hintsEmpty: '' };
	const node = document.querySelector('[data-keymap-strings]');
	if (!node?.textContent) return empty;
	try {
		return { ...empty, ...(JSON.parse(node.textContent) as Partial<Strings>) };
	} catch {
		return empty;
	}
}

/* --- enabled state ------------------------------------------------------- */

let enabled = read();

function read(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) !== 'off';
	} catch {
		// Storage blocked — default to on, the choice just won't survive a reload.
		return true;
	}
}

function write(next: boolean): void {
	enabled = next;
	try {
		localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
	} catch {
		/* storage blocked — nothing to persist to */
	}
	announce(next ? STRINGS.enabled : STRINGS.disabled);
}

/* --- scrolling ----------------------------------------------------------- */

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A scroller of our own rather than `behavior: 'smooth'`.
 *
 * Native smooth scrolling measures each new call from wherever the previous
 * animation happens to be, so holding `j` under-scrolls badly. Owning `target`
 * means repeated presses accumulate exactly, and every keypress still lands on
 * a position we chose. Each frame writes with `instant` to opt out of the
 * `scroll-behavior: smooth` declared in `global.css` — otherwise the browser
 * would animate every step of our animation.
 */
let target = 0;
let animating = false;

function scrollToOffset(next: number): void {
	const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
	target = Math.min(max, Math.max(0, next));

	if (reduced()) {
		animating = false;
		window.scrollTo({ top: target, behavior: 'instant' });
		return;
	}

	if (animating) return;
	animating = true;

	const step = () => {
		const current = window.scrollY;
		const delta = target - current;
		if (Math.abs(delta) < 0.5) {
			window.scrollTo({ top: target, behavior: 'instant' });
			animating = false;
			return;
		}

		// Close in exponentially, but cover the last few pixels in one go so that
		// a frame always asks for a visible move.
		window.scrollTo({ top: current + (Math.abs(delta) < 4 ? delta : delta * 0.22), behavior: 'instant' });

		// The real scrollable extent can sit a pixel under `scrollHeight -
		// innerHeight`, which would leave `delta` permanently above the threshold
		// and the loop running forever. A frame that moved nothing has arrived.
		if (Math.abs(window.scrollY - current) < 0.5) {
			animating = false;
			return;
		}
		requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

/** Relative move, re-synced to the live position whenever nothing is in flight. */
const scrollByOffset = (delta: number) => scrollToOffset((animating ? target : window.scrollY) + delta);

const halfPage = () => Math.round(window.innerHeight / 2);

/* --- sections ------------------------------------------------------------ */

const sections = () => Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));

/**
 * The sticky header's height, taken from the `scroll-padding-top` the
 * stylesheet already declares for anchor links, so both agree by construction.
 */
function scrollPadding(): number {
	const declared = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
	return Number.isFinite(declared) ? declared : 0;
}

function goToSection(direction: 1 | -1): void {
	const list = sections();
	if (list.length === 0) return;

	// Where focus already sits wins, because every jump leaves focus on the
	// section it landed on. The last section cannot be scrolled to the top of
	// the viewport — the page runs out first — so asking which section owns the
	// top of the screen would answer "the previous one" and send `{` two steps
	// back instead of one.
	const active = document.activeElement;
	let index = active instanceof Node ? list.findIndex((section) => section.contains(active)) : -1;

	// Nothing focused (a fresh load, or a click elsewhere): fall back to the
	// last section at or above the top of the viewport, allowing for the header.
	if (index === -1) {
		const threshold = scrollPadding() + 16;
		list.forEach((section, i) => {
			if (section.getBoundingClientRect().top <= threshold) index = i;
		});
	}

	const next = list[Math.min(list.length - 1, Math.max(0, index + direction))];
	if (!next) return;

	// Focus first, scroll second: `preventScroll` keeps the jump ours, and Tab
	// now resumes from the section instead of the top of the document.
	next.focus({ preventScroll: true });
	scrollToOffset(next.getBoundingClientRect().top + window.scrollY - scrollPadding());

	const heading = next.querySelector('h1, h2, h3')?.textContent?.trim();
	if (heading) announce(format(STRINGS.section, { name: heading }));
}

/* --- link hints ---------------------------------------------------------- */

type Hint = { label: string; element: HTMLElement; badge: HTMLElement };

let layer: HTMLElement | null = null;
let hints: Hint[] = [];
let typed = '';

const hintsActive = () => layer !== null;

/** Enough labels for `count` targets, staying single-character while it can. */
function labelsFor(count: number): string[] {
	const alphabet = [...HINT_ALPHABET];
	if (count <= alphabet.length) return alphabet.slice(0, count);

	const labels: string[] = [];
	for (const first of alphabet) {
		for (const second of alphabet) {
			if (labels.length >= count) return labels;
			labels.push(first + second);
		}
	}
	return labels;
}

/** Focusable elements actually on screen right now. */
function hintTargets(): HTMLElement[] {
	const targets: HTMLElement[] = [];
	for (const element of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
		if (element.closest('[aria-hidden="true"], [inert], dialog:not([open])')) continue;

		const rect = element.getBoundingClientRect();
		if (rect.width < 8 || rect.height < 8) continue;
		if (rect.bottom <= 0 || rect.right <= 0) continue;
		if (rect.top >= window.innerHeight || rect.left >= window.innerWidth) continue;

		const style = getComputedStyle(element);
		if (style.visibility === 'hidden' || style.opacity === '0') continue;
		// `sr-only` hides by clipping, and its padding still measures — the skip
		// link is a full-size box that paints nothing. Measuring alone would leave
		// a hint badge stranded in the corner, pointing at nothing.
		if (style.clipPath === 'inset(50%)') continue;

		targets.push(element);
	}
	return targets;
}

function showHints(): void {
	exitHints();

	const targets = hintTargets();
	if (targets.length === 0) {
		announce(STRINGS.hintsEmpty);
		return;
	}

	const labels = labelsFor(targets.length);
	// Purely visual scaffolding: screen-reader users already have link lists and
	// heading navigation, so the layer stays out of the accessibility tree.
	layer = document.createElement('div');
	layer.className = 'hint-layer';
	layer.setAttribute('aria-hidden', 'true');

	hints = targets.map((element, index) => {
		const label = labels[index] ?? '';
		const rect = element.getBoundingClientRect();
		const badge = document.createElement('span');
		badge.className = 'hint-badge';
		badge.textContent = label;
		badge.style.left = `${Math.max(2, rect.left)}px`;
		badge.style.top = `${Math.max(2, rect.top)}px`;
		layer?.append(badge);
		return { label, element, badge };
	});

	document.body.append(layer);
	typed = '';
	announce(STRINGS.hints);
}

function exitHints(): void {
	layer?.remove();
	layer = null;
	hints = [];
	typed = '';
}

function activate(element: HTMLElement): void {
	exitHints();
	element.focus({ preventScroll: true });
	// A real click, so `data-track` attributes and `href` targets behave exactly
	// as they would for a mouse user.
	element.click();
}

/** Consumes a keystroke while hints are up. Returns false to fall through. */
function handleHintKey(event: KeyboardEvent): boolean {
	if (event.key === 'Escape') {
		exitHints();
		return true;
	}
	if (event.key.length !== 1) return false;

	const next = typed + event.key.toLowerCase();
	const matches = hints.filter((hint) => hint.label.startsWith(next));

	if (matches.length === 0) {
		exitHints();
		return true;
	}

	typed = next;
	const exact = matches.find((hint) => hint.label === next);
	if (exact && matches.length === 1) {
		activate(exact.element);
		return true;
	}

	for (const hint of hints) {
		hint.badge.dataset.hintState = hint.label.startsWith(typed) ? 'match' : 'dim';
	}
	return true;
}

/* --- dialog -------------------------------------------------------------- */

const dialog = () => document.querySelector<HTMLDialogElement>('[data-keymap-dialog]');

function openHelp(): void {
	const element = dialog();
	if (!element || element.open) return;
	exitHints();
	element.showModal();
}

/* --- actions ------------------------------------------------------------- */

/** Clicks the anchor a component tagged as this jump target, if the page has one. */
function goTo(name: string): void {
	document.querySelector<HTMLElement>(`[data-goto="${name}"]`)?.click();
}

/** Typed as a total record so a new `BindingId` cannot be left unimplemented. */
const ACTIONS: Record<BindingId, () => void> = {
	scrollDown: () => scrollByOffset(SCROLL_STEP),
	scrollUp: () => scrollByOffset(-SCROLL_STEP),
	halfPageDown: () => scrollByOffset(halfPage()),
	halfPageUp: () => scrollByOffset(-halfPage()),
	goTop: () => {
		scrollToOffset(0);
		announce(STRINGS.top);
	},
	goBottom: () => {
		scrollToOffset(document.documentElement.scrollHeight);
		announce(STRINGS.bottom);
	},
	nextSection: () => goToSection(1),
	prevSection: () => goToSection(-1),
	followLink: showHints,
	goHome: () => goTo('home'),
	goFeatures: () => goTo('features'),
	goDocs: () => goTo('docs'),
	goRepo: () => goTo('repo'),
	toggleTheme: () => document.querySelector<HTMLButtonElement>('[data-theme-toggle]')?.click(),
	showHelp: openHelp,
};

/* --- key handling -------------------------------------------------------- */

let pending: string[] = [];
let chordTimer: number | undefined;

const resetChord = () => {
	window.clearTimeout(chordTimer);
	pending = [];
};

const matches = (sequence: readonly string[], keys: string[]) =>
	keys.length <= sequence.length && keys.every((key, index) => sequence[index] === key);

/** True when the keystroke belongs to the page rather than to us. */
function isTyping(event: KeyboardEvent): boolean {
	if (event.altKey || event.ctrlKey || event.metaKey) return true;

	const target = event.target;
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	return ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(target.tagName);
}

document.addEventListener('keydown', (event) => {
	if (event.defaultPrevented || event.isComposing || isTyping(event)) return;

	if (hintsActive()) {
		if (handleHintKey(event)) event.preventDefault();
		return;
	}

	if (!enabled) return;
	// Inside the shortcut dialog the shortcuts themselves would be a trap: the
	// page would scroll behind an open modal. Escape closes it natively.
	if (dialog()?.open) return;

	const attempt = [...pending, event.key];
	const exact = KEYMAP.find((binding) => binding.sequence.length === attempt.length && matches(binding.sequence, attempt));

	if (exact) {
		resetChord();
		event.preventDefault();
		ACTIONS[exact.id]();
		return;
	}

	if (KEYMAP.some((binding) => matches(binding.sequence, attempt))) {
		// A valid prefix (`g` of `gg`) — hold it, briefly.
		window.clearTimeout(chordTimer);
		pending = attempt;
		chordTimer = window.setTimeout(resetChord, CHORD_TIMEOUT);
		event.preventDefault();
		return;
	}

	// Not a continuation. Drop the prefix and let this key start a sequence of
	// its own, so `g` then `j` still scrolls down.
	if (pending.length > 0) {
		resetChord();
		const restart = KEYMAP.find((binding) => binding.sequence.length === 1 && binding.sequence[0] === event.key);
		if (restart) {
			event.preventDefault();
			ACTIONS[restart.id]();
		}
	}
});

// Hints are positioned in viewport coordinates, so anything that moves the
// viewport invalidates them.
for (const type of ['scroll', 'resize', 'blur'] as const) {
	window.addEventListener(type, () => hintsActive() && exitHints(), { passive: true });
}

/* --- dialog wiring ------------------------------------------------------- */

const sheet = dialog();

if (sheet) {
	for (const trigger of document.querySelectorAll<HTMLElement>('[data-keymap-open]')) {
		// Shortcuts are a scripted feature; the trigger only exists once we run.
		trigger.hidden = false;
		trigger.addEventListener('click', openHelp);
	}

	for (const closer of sheet.querySelectorAll<HTMLElement>('[data-keymap-close]')) {
		closer.addEventListener('click', () => sheet.close());
	}

	// A modal `<dialog>` fills the viewport with its backdrop, so a click that
	// lands on the element itself landed outside the panel.
	sheet.addEventListener('click', (event) => {
		if (event.target === sheet) sheet.close();
	});

	const checkbox = sheet.querySelector<HTMLInputElement>('[data-keymap-enabled]');
	if (checkbox) {
		checkbox.checked = enabled;
		checkbox.addEventListener('change', () => write(checkbox.checked));
	}
}
