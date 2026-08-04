import { asset } from '../lib/asset'

/**
 * Portraits-of-light — a flat 2-column photo grid (no titles).
 * Real photos exported from the Figma Development §v2 Portraits frame.
 */
export const portraits: string[] = Array.from({ length: 10 }, (_, i) =>
  asset(`/content/portraits/p${i + 1}.jpg`),
)
