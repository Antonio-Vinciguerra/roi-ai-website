export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
// Long readable middle; clipping occurs only on arrival and near the top edge.
export function textRollFrame(top, height, viewport, header = 78) {
  const entryDistance = Math.max(90, Math.min(260, viewport * .3));
  const enter = smooth((viewport * .98 - top) / entryDistance);
  const leave = smooth((header + 8 - (top + height)) / Math.max(72, Math.min(height, 160)));
  return { y: (1 - enter) * 130 - leave * 130, tilt: (1 - enter) * -5 + leave * 5 };
}
export function landscapeFrame(top, height, index) {
  const progress = clamp((height * .95 - top) / Math.max(1, height * .75));
  return {
    opacity: index === 0 ? 1 : progress * progress * (3 - 2 * progress),
    shift: (clamp(top / Math.max(1, height)) - .5) * 36,
  };
}
