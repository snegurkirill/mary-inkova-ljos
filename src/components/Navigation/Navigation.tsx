import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import wordmark from '../../assets/wordmark.svg'
import { buildColumns } from '../../data/menu'
import { getProject } from '../../data/projects'
import Menu from './Menu'
import styles from './Navigation.module.css'

/**
 * Navigation module.
 *  - Desktop: left column, full height, not scrollable, 10px padding. Header
 *    (logotype + full Menu) vertically centred; Info-text pinned to the bottom.
 *  - Mobile: stacked on top; logotype + the collapsed Menu (selected items).
 *    When there is Info-text (the Project page), it shows in full at the top of
 *    the page and smoothly collapses into an «о проекте» toggle button as you
 *    scroll — the button sits opposite the breadcrumb, on the same line.
 *    Tapping the logotype opens a full-screen overlay with the *uncollapsed*
 *    Menu (all items, not just the selected ones), showing only its first two
 *    columns (e.g. on an Artwork page: проекты + the project list, but not
 *    the — potentially long — artwork list). Closes on a second tap, tapping
 *    the backdrop, or navigating.
 *
 * A hidden measurer always renders the header as it will actually appear so the
 * reported width (used to decide the mobile switch) stays stable across modes.
 */
function infoTextFor(path: string): string | null {
  const p = path.replace(/^\/+|\/+$/g, '').split('/')
  if (p[0] === 'project' && p[1] && !p[2]) {
    return getProject(p[1])?.description ?? null
  }
  return null
}

export default function Navigation({
  isMobile,
  collapsedMenu = false,
  onWidth,
}: {
  isMobile: boolean
  collapsedMenu?: boolean
  onWidth: (w: number) => void
}) {
  const { pathname } = useLocation()
  const columns = buildColumns(pathname)
  const info = infoTextFor(pathname)

  const measureRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState<number>()

  // Mobile Info-text collapse: full at the top, collapses to a button after
  // even a tiny scroll down. Any further scroll also closes it again even if
  // it was reopened via the button.
  //
  // Uses hysteresis (two different thresholds) instead of one: a small scroll
  // down (past CLOSE_AT) closes it, but it only re-opens automatically once
  // scrolled essentially all the way back to the top (past OPEN_AT, ~0). A
  // single shared threshold would flap open/closed on the natural jitter of a
  // hesitant/slow scroll gesture hovering right around that value.
  const CLOSE_AT = 8
  const OPEN_AT = 2
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setScrolled(false)
    setOpen(false)
    if (!isMobile || !info) return
    let closed = false
    const onScroll = () => {
      const y = window.scrollY
      if (!closed && y > CLOSE_AT) {
        closed = true
        setScrolled(true)
      } else if (closed && y <= OPEN_AT) {
        closed = false
        setScrolled(false)
      }
      setOpen(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile, info, pathname])
  const infoOpen = !scrolled || open

  // Mobile menu overlay: tapping the logotype toggles it; navigating away
  // (pathname change) or leaving mobile always closes it.
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, isMobile])

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => {
      const width = Math.ceil(el.offsetWidth) + 20 // + 10px padding each side
      setW(width)
      onWidth(width)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pathname, onWidth])

  const logo = (
    <img
      className={styles.logo}
      src={wordmark}
      alt="Mary Inkova Ljós"
      width={245}
      height={32}
    />
  )

  // On mobile the logotype also toggles the full-menu overlay.
  const mobileLogo = (
    <button
      type="button"
      className={styles.logoBtn}
      onClick={() => setMenuOpen((o) => !o)}
      aria-expanded={menuOpen}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
    >
      {logo}
    </button>
  )

  return (
    <nav
      className={`${styles.module} ${isMobile ? styles.mobileModule : ''}`}
      style={!isMobile && w ? { width: w } : undefined}
    >
      {/* hidden measurer: the header as it will actually render (collapsed on
          the Work page), for a stable width. */}
      <div ref={measureRef} className={styles.measurer} aria-hidden>
        {logo}
        <Menu columns={columns} pathname={pathname} collapsed={collapsedMenu} />
      </div>

      {isMobile ? (
        <>
          <div className={styles.mobileHeader}>
            {mobileLogo}
            {info ? (
              <div className={styles.menuRow}>
                <Menu columns={columns} pathname={pathname} collapsed />
                <button
                  type="button"
                  className={styles.infoBtn}
                  data-visible={scrolled}
                  aria-expanded={infoOpen}
                  onClick={() => setOpen((o) => !o)}
                >
                  о проекте
                </button>
              </div>
            ) : (
              <Menu columns={columns} pathname={pathname} collapsed />
            )}
            {info && (
              <div className={styles.infoWrap} data-open={infoOpen}>
                <p className={styles.info}>{info}</p>
              </div>
            )}
          </div>

          {/* Full-menu overlay, opened by tapping the logotype. Sits above
              (and visually replaces) the real sticky header — it carries its
              own logo/close button — and shows the uncollapsed Menu (every
              item, not just selected) but only its first two columns. */}
          <div className={styles.overlay} data-open={menuOpen} aria-hidden={!menuOpen}>
            <button
              type="button"
              className={styles.overlayBackdrop}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              aria-label="Close menu"
            />
            <div
              className={styles.overlayPanel}
              // Close on any menu-item tap — including the already-selected
              // page, whose link doesn't change the pathname and so wouldn't
              // otherwise trigger the pathname-change close effect above.
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) setMenuOpen(false)
              }}
            >
              {mobileLogo}
              <Menu columns={columns.slice(0, 2)} pathname={pathname} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header is absolutely centred so the logotype sits at the
              vertical middle of the display, whatever the menu depth.
              The Work page uses the collapsed (breadcrumb) menu here. */}
          <div className={styles.header}>
            {logo}
            <Menu
              columns={columns}
              pathname={pathname}
              collapsed={collapsedMenu}
            />
          </div>
          {info && <p className={styles.info}>{info}</p>}
        </>
      )}
    </nav>
  )
}
