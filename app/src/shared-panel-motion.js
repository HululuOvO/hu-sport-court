// Native sticky positioning carries the panel; JS only blends its visual treatment.
export function journeyProgress(scroll, start, distance, reduced = false) {
  const value = Math.min(1, Math.max(0, (scroll - start) / Math.max(1, distance)));
  if (reduced) return value >= .5 ? 1 : 0;
  return value * value * (3 - 2 * value);
}
