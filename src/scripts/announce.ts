/**
 * Screen-reader announcements.
 *
 * BaseLayout renders one polite live region; anything that changes the page
 * without moving focus — a theme switch, a keyboard jump — routes its message
 * through here rather than growing a live region of its own. Politeness is
 * fixed on purpose: nothing this site does is urgent enough for `assertive`,
 * which would interrupt whatever the user is currently hearing.
 */

let timer: number | undefined;

export function announce(message: string): void {
	const region = document.querySelector<HTMLElement>('[data-live-region]');
	if (!region || !message) return;

	// Writing the same string twice is a no-op for most screen readers, so the
	// region is cleared first — otherwise a second "Top of the page" is silent.
	region.textContent = '';
	window.clearTimeout(timer);
	timer = window.setTimeout(() => {
		region.textContent = message;
	}, 60);
}

/** Fills `{name}`-style placeholders in a translated string. */
export function format(template: string, values: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
