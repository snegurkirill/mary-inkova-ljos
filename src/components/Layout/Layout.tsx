import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from '../Navigation/Navigation'
import GradientMapDefs from '../GradientFilter/GradientMapDefs'
import { LayoutContext } from './LayoutContext'
import { isArtworkPath } from '../../lib/nav'
import { useScrollFilterState } from '../../hooks/useScrollFilterState'
import styles from './Layout.module.css'

/**
 * App shell. Navigation (left) shows its Menu and hugs its width; Content
 * (right) fills the rest. Going mobile (stacked) is page-driven: each page
 * reports the width its content needs (`setMinContent`); we stack once the
 * space beside the Navigation drops below that.
 *
 * The Work page (an Artwork) shows the full menu on desktop like other pages,
 * but fits the viewport with no scroll (the picture adapts to the space). It
 * also stacks to mobile the moment the content module would be narrower than
 * the Navigation module itself — even if its own min-content is still met.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const [navWidth, setNavWidth] = useState<number>()
  const [winW, setWinW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  )
  const [minContent, setMinContent] = useState(340)
  const contentRef = useRef<HTMLElement>(null)

  // Drives the global scroll-activated gradient-map filter (GradientFilterOverlay).
  useScrollFilterState()

  useEffect(() => {
    const on = () => setWinW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }, [pathname])

  const isWork = isArtworkPath(pathname)
  const contentWidth = navWidth !== undefined ? winW - navWidth : undefined
  const isMobile =
    contentWidth !== undefined &&
    (contentWidth < minContent || (isWork && contentWidth < navWidth!))

  return (
    <LayoutContext.Provider value={{ isMobile, setMinContent }}>
      <GradientMapDefs />
      <div
        className={[
          styles.shell,
          isMobile ? styles.mobile : '',
          isWork ? styles.fit : '',
        ].join(' ')}
      >
        <Navigation isMobile={isMobile} onWidth={setNavWidth} />
        <main ref={contentRef} className={styles.content}>
          <Outlet />
        </main>
      </div>
    </LayoutContext.Provider>
  )
}
