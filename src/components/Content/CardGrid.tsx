import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useColumns } from '../../hooks/useColumns'
import { useLayout } from '../Layout/LayoutContext'
import styles from './CardGrid.module.css'

/**
 * Left-aligned responsive grid for the Content module.
 *
 * On desktop it picks the largest of `candidates` columns whose cards stay
 * ≥ `minCardWidth`. It reports the width needed for its *smallest* desktop
 * column count (the last candidate) to the Layout, which flips to mobile once
 * that no longer fits beside the Navigation. On mobile it uses `mobileCols`.
 *
 * So e.g. Gallery `[3,2,1]` shrinks 3→2→1 then goes mobile; Project `[2,1]`
 * shrinks 2→1 (still side-by-side with Navigation) and only goes mobile once
 * even 1 column is too narrow.
 *
 * `gap` is the column gap; `rowGap` (defaults to `gap`) is the row gap — pass
 * 0 for card styles (like Works/Project's WorkCard) whose own label provides
 * the vertical breathing room between rows.
 */
export default function CardGrid<T>({
  items,
  candidates,
  minCardWidth,
  gap,
  rowGap = gap,
  renderItem,
  padding = gap,
  mobileCols = 1,
}: {
  items: T[]
  candidates: number[]
  minCardWidth: number
  gap: number
  rowGap?: number
  renderItem: (item: T, index: number) => ReactNode
  padding?: number
  mobileCols?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { isMobile, setMinContent } = useLayout()
  const desktopCols = useColumns(ref, candidates, minCardWidth)
  const cols = isMobile ? mobileCols : desktopCols

  useLayoutEffect(() => {
    const lc = candidates[candidates.length - 1]
    setMinContent(lc * minCardWidth + (lc - 1) * gap + 2 * padding)
  }, [candidates, minCardWidth, gap, padding, setMinContent])

  return (
    <div
      ref={ref}
      className={styles.grid}
      style={{ columnGap: gap, rowGap, padding }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className={styles.cell}
          style={{ flexBasis: `calc((100% - ${(cols - 1) * gap}px) / ${cols})` }}
        >
          {renderItem(it, i)}
        </div>
      ))}
    </div>
  )
}
