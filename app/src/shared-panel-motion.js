const clamp = value => Math.min(1, Math.max(0, value));
export function sharedPanelFrame({ scroll, heroTop, heroLeft, heroWidth, targetTop, targetLeft, targetWidth, dockTop, landingY, viewportHeight, reduced = false }) {
  const pinY = Math.min(heroTop, Math.max(landingY, viewportHeight * .23));
  const start = Math.max(0, heroTop - pinY);
  const end = Math.max(start + 240, targetTop - landingY);
  const progress = clamp((scroll - start) / (end - start));
  const heroScale = heroWidth / Math.max(1, targetWidth);
  if (reduced) return progress < .5
    ? { x: heroLeft, y: heroTop - scroll, scale: heroScale, progress: 0, phase: "hero" }
    : { x: targetLeft, y: dockTop, scale: 1, progress: 1, phase: "story" };
  if (scroll <= start) return { x: heroLeft, y: heroTop - scroll, scale: heroScale, progress: 0, phase: "hero" };
  if (scroll >= end) return { x: targetLeft, y: dockTop, scale: 1, progress: 1, phase: "story" };
  const eased = progress * progress * (3 - 2 * progress);
  return {
    x: heroLeft + (targetLeft - heroLeft) * eased,
    y: pinY + (landingY - pinY) * eased + Math.sin(Math.PI * progress) * 24,
    scale: heroScale + (1 - heroScale) * eased,
    progress: eased,
    phase: "handoff",
  };
}
