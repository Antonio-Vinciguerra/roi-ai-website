export const clamp = value => Math.max(0, Math.min(1, value));
export function landscapeFrame(top, height, index) {
  const progress = clamp((height * .95 - top) / Math.max(1, height * .75));
  return {
    opacity: index === 0 ? 1 : progress * progress * (3 - 2 * progress),
    shift: (clamp(top / Math.max(1, height)) - .5) * 36,
  };
}
