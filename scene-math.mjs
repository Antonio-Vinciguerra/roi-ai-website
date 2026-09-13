export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
// Opacity only: a broad, fully visible reading zone between entrance and exit.
export function textDissolveFrame(top, height, viewport, header = 78, hero = false) {
  const enter = hero ? 1 : smooth((viewport - top) / Math.max(70, viewport * .18));
  const leave = smooth((header - (top + height)) / Math.max(60, Math.min(height, 120)));
  return enter * (1 - leave);
}
export function approachOpacity(current, target, elapsed, timeConstant = 520) {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, elapsed) / timeConstant));
}
export function landscapeFrame(top, height, index) {
  const progress = clamp((height * .95 - top) / Math.max(1, height * .75));
  return {
    opacity: index === 0 ? 1 : progress * progress * (3 - 2 * progress),
    shift: (clamp(top / Math.max(1, height)) - .5) * 36,
  };
}
