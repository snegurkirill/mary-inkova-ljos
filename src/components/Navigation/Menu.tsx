import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { MenuColumn } from '../../data/menu'
import { shouldFade } from '../../lib/nav'
import styles from './Menu.module.css'

/**
 * Miller-column menu. Columns run [nav, projects?, artworks?]; sizes are
 * 14/12/10px from the front column back. Each column is shifted with translateY
 * so its selected item lands on the row's centre line (the logotype line).
 *
 * Colour is a single left→right gradient (gray #695f5f → blue #1a438f) that
 * stretches across the whole menu width and runs continuously through every
 * column. We do this by clipping one full-width gradient to each item's text
 * (`background-clip: text`) and offsetting it by the item's measured x so the
 * slices line up. Selected items are full opacity, others 30%.
 *
 * `collapsed` (mobile / breadcrumb) shows only the selected item of each column.
 */
export default function Menu({
  columns,
  pathname,
  collapsed = false,
}: {
  columns: MenuColumn[]
  pathname: string
  collapsed?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const last = columns.length - 1

  // Align each item's slice of the full-width gradient.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const apply = () => {
      const rb = root.getBoundingClientRect()
      const w = Math.max(rb.width, 1)
      root.querySelectorAll<HTMLElement>('[data-grad]').forEach((el) => {
        const b = el.getBoundingClientRect()
        el.style.setProperty('--gw', `${w}px`)
        el.style.setProperty('--gx', `${-(b.left - rb.left)}px`)
      })
    }
    apply()
    const raf = requestAnimationFrame(apply)
    const ro = new ResizeObserver(apply)
    ro.observe(root)
    document.fonts?.ready.then(apply)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [columns, pathname, collapsed])

  if (collapsed) {
    return (
      <div ref={rootRef} className={styles.collapsed}>
        {columns.map((col, i) => {
          const sel = col.selectedIndex
          if (sel < 0) return null
          const it = col.items[sel]
          return (
            <Link
              key={i}
              to={it.to}
              viewTransition={shouldFade(pathname, it.to)}
              data-grad
              className={styles.item}
              style={{ fontSize: 14 - 2 * (last - i) }}
            >
              {it.label}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={rootRef} className={styles.menu}>
      {columns.map((col, i) => (
        <Column
          key={i}
          col={col}
          pathname={pathname}
          fontSize={14 - 2 * (last - i)}
        />
      ))}
    </div>
  )
}

function Column({
  col,
  pathname,
  fontSize,
}: {
  col: MenuColumn
  pathname: string
  fontSize: number
}) {
  const lh = fontSize * 1.5
  const n = col.items.length
  const offset =
    col.selectedIndex >= 0 ? ((n - 1) / 2 - col.selectedIndex) * lh : 0

  return (
    <ul
      className={styles.list}
      style={{
        fontSize,
        lineHeight: `${lh}px`,
        letterSpacing: `${-0.011 * fontSize}px`,
        transform: `translateY(${offset}px)`,
      }}
    >
      {col.items.map((it, i) => (
        <li key={i}>
          <Link
            to={it.to}
            viewTransition={shouldFade(pathname, it.to)}
            data-grad
            className={styles.item}
            style={{ opacity: it.selected ? 1 : 0.3 }}
          >
            {it.label || ' '}
          </Link>
        </li>
      ))}
    </ul>
  )
}
