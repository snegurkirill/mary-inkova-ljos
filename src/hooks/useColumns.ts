import { useEffect, useState } from 'react'

/**
 * Pick the largest column count from `candidates` (e.g. [5, 3, 1]) such that
 * each card is at least `minCardWidth` px wide, given the observed container
 * width. Falls back to the smallest candidate. Re-computes on resize.
 *
 * The showcase always fills the full container width; this only decides how
 * many columns that width is divided into.
 */
export function useColumns(
  ref: React.RefObject<HTMLElement | null>,
  candidates: number[],
  minCardWidth: number,
): number {
  const [cols, setCols] = useState(candidates[0])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth
      if (!w) return
      const best =
        candidates.find((c) => w / c >= minCardWidth) ??
        candidates[candidates.length - 1]
      setCols(best)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, minCardWidth, candidates])

  return cols
}
