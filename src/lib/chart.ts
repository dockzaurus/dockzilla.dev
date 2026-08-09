/**
 * Minimal chart geometry, evaluated at build time.
 *
 * The reference design used Recharts, which would have meant shipping React to
 * a static marketing page. The series is known at build time, so we render the
 * SVG paths ourselves and ship zero bytes of chart runtime.
 */

export type Point = { x: number; y: number };

export type ChartGeometry = {
	width: number;
	height: number;
	/** Smoothed stroke path through the points. */
	line: string;
	/** `line`, closed along the baseline, for the gradient fill. */
	area: string;
	points: Point[];
};

export type ScaleOptions = {
	width: number;
	height: number;
	padding: { top: number; right: number; bottom: number; left: number };
	/** Upper bound of the value axis. Defaults to the series maximum. */
	max?: number;
};

function toPoints(values: readonly number[], options: ScaleOptions): Point[] {
	const { width, height, padding } = options;
	const plotWidth = width - padding.left - padding.right;
	const plotHeight = height - padding.top - padding.bottom;
	const max = options.max ?? Math.max(...values, 1);
	const lastIndex = Math.max(values.length - 1, 1);

	return values.map((value, index) => ({
		x: padding.left + (index / lastIndex) * plotWidth,
		y: padding.top + plotHeight - (Math.max(value, 0) / max) * plotHeight,
	}));
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Cardinal spline through every point, emitted as cubic beziers. Tension 0.5
 * approximates Recharts' `type="monotone"` closely enough at this size.
 */
function toSmoothPath(points: Point[]): string {
	if (points.length === 0) return '';
	const [first] = points;
	if (!first) return '';
	if (points.length < 3) {
		return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)},${round(p.y)}`).join(' ');
	}

	let path = `M${round(first.x)},${round(first.y)}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[Math.max(i - 1, 0)]!;
		const p1 = points[i]!;
		const p2 = points[i + 1]!;
		const p3 = points[Math.min(i + 2, points.length - 1)]!;

		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;

		path += ` C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(p2.x)},${round(p2.y)}`;
	}
	return path;
}

export function buildSeries(values: readonly number[], options: ScaleOptions): ChartGeometry {
	const points = toPoints(values, options);
	const line = toSmoothPath(points);
	const baseline = options.height - options.padding.bottom;
	const first = points[0];
	const last = points[points.length - 1];

	const area =
		line && first && last
			? `${line} L${round(last.x)},${round(baseline)} L${round(first.x)},${round(baseline)} Z`
			: '';

	return { width: options.width, height: options.height, line, area, points };
}

/** Evenly spaced axis ticks from 0 to `max`, inclusive. */
export function ticks(max: number, count: number): number[] {
	return Array.from({ length: count + 1 }, (_, i) => (max / count) * i);
}
