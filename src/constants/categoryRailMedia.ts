/**
 * Single media strategy for the right rail (Pinia + `#category-toolbar-anchor`) and for
 * Category.vue toolbar teleport + landscape split layout:
 *
 * - ≥1024px: rail visible (Tailwind-aligned “lg” tablets/desktop), any orientation.
 * - 768–1023px landscape: rail only when viewport is tall enough (min-height) so typical
 *   phone landscape (wide but short) does not pick up tablet/split-layout behavior.
 *
 * Match exactly in JS (matchMedia) and in CSS @media wherever the layout must agree.
 */
export const CATEGORY_RIGHT_RAIL_MEDIA =
  '(min-width: 1024px), (min-width: 768px) and (orientation: landscape) and (min-height: 500px)'

/** Tailwind `lg` — aligns with App.vue Pinia sidebar hide-on-pure rules (pureMode ∧ lg). */
export const TW_LG_MEDIA = '(min-width: 1024px)'
