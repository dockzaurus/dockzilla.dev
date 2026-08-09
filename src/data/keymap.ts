/**
 * The vim-style keyboard layer: which keys exist, and how they are grouped.
 *
 * Split the same way as `landing.ts` — this file owns *what* is bound and in
 * which order, `src/i18n/locales/*` owns the words describing each binding, and
 * `src/scripts/vim.ts` owns the behaviour. The exported `BindingId` union is
 * what forces all three to stay in step: a new id is a type error in every
 * locale and in the engine's action table until it is handled.
 */

export const KEYMAP_SECTION_IDS = ['motion', 'jump', 'action'] as const;
export type KeymapSectionId = (typeof KEYMAP_SECTION_IDS)[number];

export const BINDING_IDS = [
	'scrollDown',
	'scrollUp',
	'halfPageDown',
	'halfPageUp',
	'goTop',
	'goBottom',
	'nextSection',
	'prevSection',
	'followLink',
	'goHome',
	'goFeatures',
	'goDocs',
	'goRepo',
	'toggleTheme',
	'showHelp',
] as const;
export type BindingId = (typeof BINDING_IDS)[number];

export type Binding = {
	readonly id: BindingId;
	readonly section: KeymapSectionId;
	/**
	 * Literal `KeyboardEvent.key` values, in order — two entries make a chord
	 * (`g` then `g`). Matching on `key` rather than `code` is deliberate: vim
	 * bindings are characters, so this stays correct on AZERTY and friends, and
	 * shifted keys (`G`, `?`, `{`) arrive already resolved.
	 */
	readonly sequence: readonly string[];
};

export const KEYMAP: readonly Binding[] = [
	{ id: 'scrollDown', section: 'motion', sequence: ['j'] },
	{ id: 'scrollUp', section: 'motion', sequence: ['k'] },
	{ id: 'halfPageDown', section: 'motion', sequence: ['d'] },
	{ id: 'halfPageUp', section: 'motion', sequence: ['u'] },
	{ id: 'goTop', section: 'motion', sequence: ['g', 'g'] },
	{ id: 'goBottom', section: 'motion', sequence: ['G'] },
	{ id: 'nextSection', section: 'motion', sequence: ['}'] },
	{ id: 'prevSection', section: 'motion', sequence: ['{'] },

	{ id: 'followLink', section: 'jump', sequence: ['f'] },
	{ id: 'goHome', section: 'jump', sequence: ['g', 'h'] },
	{ id: 'goFeatures', section: 'jump', sequence: ['g', 'f'] },
	{ id: 'goDocs', section: 'jump', sequence: ['g', 'd'] },
	{ id: 'goRepo', section: 'jump', sequence: ['g', 'r'] },

	{ id: 'toggleTheme', section: 'action', sequence: ['t'] },
	{ id: 'showHelp', section: 'action', sequence: ['?'] },
];
