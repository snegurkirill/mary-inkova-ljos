import { useEffect } from 'react'

/**
 * Toggles `data-scrolling="true"` on <html> while the user is actively
 * scrolling anywhere on the page, clearing it `idleDelay` ms after the last
 * scroll event. Drives the global gradient-map filter fade (see
 * GradientFilterOverlay): filters fade in while scrolling, fade out at rest.
 *
 * A capturing listener on `document` catches scroll events from *any*
 * scrollable descendant too — 'scroll' doesn't bubble, but capture-phase
 * listeners on an ancestor still see it on the way down to its target, so
 * this covers both plain window scroll and the desktop Layout's own
 * scrollable `.content` container with one listener.
 */
export function useScrollFilterState(idleDelay = 250) {
  useEffect(() => {
    const root = document.documentElement
    let timer: ReturnType<typeof setTimeout>
    const onScroll = () => {
      root.setAttribute('data-scrolling', 'true')
      clearTimeout(timer)
      timer = setTimeout(() => root.removeAttribute('data-scrolling'), idleDelay)
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      clearTimeout(timer)
      root.removeAttribute('data-scrolling')
    }
  }, [idleDelay])
}
