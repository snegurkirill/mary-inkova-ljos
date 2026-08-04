let canvas: HTMLCanvasElement | null = null

/** Width in px of `text` rendered with `font` (a CSS shorthand). */
export function textWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 8
  if (!canvas) canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return text.length * 8
  ctx.font = font
  return ctx.measureText(text).width
}
