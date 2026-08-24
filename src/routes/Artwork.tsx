import { useCallback, useEffect, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLayout } from '../components/Layout/LayoutContext'
import { getArtwork } from '../data/projects'
import { textWidth } from '../lib/measureText'
import NotFound from './NotFound'
import styles from './Artwork.module.css'

const META_FONT = "14px 'Inter', system-ui, sans-serif"
const META_GAP = 20 // matches .meta / .params gap in Artwork.module.css
const PAGE_PADDING = 20 // .page padding, 10px each side

/**
 * Artwork — a single work. Content has no padding/gaps: the image expands as
 * large as it can (keeping proportions), vertically centred and — on desktop —
 * aligned to the right (mobile keeps it left-aligned), with the work
 * parameters + buy button below. Prev/next between artworks is instant (click
 * the image halves or use arrow keys); the Menu also lists the works.
 *
 * The mobile switch is based on the meta line (technique · size · Приобрести)
 * actually fitting on one line, so it never wraps while side-by-side with the
 * Navigation — same idea as Project/Gallery's text-measured breakpoints. It
 * also stacks the moment the content module gets narrower than the Navigation
 * module (handled in Layout.tsx).
 *
 * Deliberately has no GradientFilterOverlay (unlike other pages' images): this
 * page never scrolls, so the scroll-activated duotone filter would never have
 * a chance to show.
 */
export default function Artwork() {
  const { slug, artworkId } = useParams()
  const navigate = useNavigate()
  const { isMobile, setMinContent } = useLayout()
  const { project, artwork, index } = getArtwork(slug ?? '', artworkId ?? '')
  const n = project?.artworks.length ?? 0

  useLayoutEffect(() => {
    const parts = [artwork?.technique, artwork?.size].filter(Boolean) as string[]
    const paramsWidth = parts.reduce(
      (sum, t, i) => sum + textWidth(t, META_FONT) + (i > 0 ? META_GAP : 0),
      0,
    )
    const buyWidth = artwork?.price ? textWidth('Приобрести', META_FONT) : 0
    const metaWidth =
      paramsWidth + (paramsWidth && buyWidth ? META_GAP : 0) + buyWidth
    setMinContent(Math.ceil(metaWidth) + PAGE_PADDING)
  }, [artwork, setMinContent])

  const go = useCallback(
    (delta: number) => {
      if (!project || n === 0) return
      const next = project.artworks[(index + delta + n) % n]
      navigate(`/project/${project.slug}/${next.id}`, {
        replace: true,
        viewTransition: true,
      })
    },
    [project, index, n, navigate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!project || !artwork) return <NotFound />

  return (
    <section
      className={`${styles.page} ${isMobile ? styles.pageMobile : ''}`}
      data-page="artwork"
    >
      <figure
        className={`${styles.frame} ${isMobile ? styles.frameMobile : ''}`}
      >
        <img src={artwork.image} alt={artwork.title} />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneLeft}`}
          onClick={() => go(-1)}
          aria-label="Previous artwork"
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneRight}`}
          onClick={() => go(1)}
          aria-label="Next artwork"
        />
      </figure>

      {(artwork.technique || artwork.size || artwork.price) && (
        <div className={styles.meta}>
          {(artwork.technique || artwork.size) && (
            <div className={styles.params}>
              {artwork.technique && <span>{artwork.technique}</span>}
              {artwork.size && <span>{artwork.size}</span>}
            </div>
          )}
          {artwork.price && (
            <button type="button" className={styles.buy}>
              Приобрести
            </button>
          )}
        </div>
      )}
    </section>
  )
}
