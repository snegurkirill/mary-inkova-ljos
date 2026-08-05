import { useEffect, useRef, useState } from 'react'
import { useLayout } from '../Layout/LayoutContext'
import styles from './GradientFilterOverlay.module.css'

/** Nearest scrollable ancestor (the actual intersection root) — the desktop
 *  Layout's `.content` (overflow-y: auto). Needed because IntersectionObserver's
 *  `rootMargin` only expands the *implicit* (outermost) root — an intervening
 *  clipping ancestor still clips at its own exact bounds first, silently
 *  zeroing the margin out for anything inside it unless handed in as `root`
 *  explicitly. Only ever called once `isMobile` is settled (see below) —
 *  `.content` only has this clipping shape on desktop. */
function nearestScrollParent(el: Element): Element | null {
  let node = el.parentElement
  while (node) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node
    node = node.parentElement
  }
  return null
}

/**
 * Duotone (white → #5CA3FF → white) gradient-map overlay for a single photo.
 * Drop it as a sibling right after the real <img>, inside the same
 * position:relative box that image already sits in. Invisible at rest; fades
 * in while the page is scrolling, fades out when it stops.
 *
 * The SVG filter is expensive to rasterize, and image-heavy grids (e.g. the
 * «работы» page, which stacks every artwork from every project) can have
 * dozens of these mounted at once — toggling `data-scrolling` used to
 * rasterize all of them in the same frame, which is what showed up as a
 * delayed/stuttering fade, worst on desktop where more of the grid is
 * visible at once. So the filtered copy itself only exists (is in the DOM at
 * all) while its image is near the viewport (a generous rootMargin buffer,
 * so it's already rasterized well before it's scrolled into view); anything
 * further off-screen renders nothing here and costs nothing.
 *
 * `isMobile` (from Layout) picks the right intersection root: null (the
 * window) on mobile, the desktop Layout's own scrollable `.content` box on
 * desktop — and re-derives it whenever isMobile changes, not just once on
 * mount. isMobile itself starts out `false` for a beat before Layout's async
 * width measurement settles it, even on an actually-mobile page; recomputing
 * only once that's stable avoids ever pinning `root` to `.content` while it
 * still happens to have desktop's clipping CSS, then having that same
 * element go non-clipping under it once the mobile layout applies — which
 * silently breaks the intersection math (everything reads as "visible").
 */
export default function GradientFilterOverlay({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const { isMobile } = useLayout()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = isMobile ? null : nearestScrollParent(el)
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      root,
      rootMargin: '600px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [isMobile])

  return (
    <div ref={ref} className={styles.overlay} aria-hidden="true">
      {near && (
        <div
          className={styles.overlayImage}
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
    </div>
  )
}
