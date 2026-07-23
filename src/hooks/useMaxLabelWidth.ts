import { useEffect, useState } from 'react'

let canvas: HTMLCanvasElement | null = null
function measure(text: string, font: string): number {
  if (!canvas) canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

/**
 * Measure the widest "name + gap + year" label across `items`, in px, using
 * the real font once it has loaded. Used to decide how narrow a card may get
 * before the label would overlap / wrap.
 */
export function useMaxLabelWidth(
  items: { name: string; year: string }[],
  font = "14px 'Inter', system-ui, sans-serif",
  gap = 12,
): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    let cancelled = false
    const run = () => {
      if (cancelled) return
      const max = items.reduce((m, it) => {
        const w = measure(it.name, font) + gap + measure(it.year, font)
        return Math.max(m, w)
      }, 0)
      setWidth(Math.ceil(max))
    }
    run()
    // Re-measure once web fonts are ready (first pass may use a fallback).
    document.fonts?.ready.then(run)
    return () => {
      cancelled = true
    }
  }, [items, font, gap])

  return width
}
