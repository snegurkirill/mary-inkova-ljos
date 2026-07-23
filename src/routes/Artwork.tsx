import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtwork } from '../data/projects'
import NotFound from './NotFound'
import styles from './Artwork.module.css'

/**
 * Artwork — expanded. A single artwork in a matte box that fills the space
 * between header and footer (32px margins), with looping prev/next navigation:
 * click the ◦• / •◦ controls, click the left/right half of the image, or use
 * the arrow keys. The image box has 32px-margin controls that shift below it
 * when the viewport is too narrow.
 */
export default function Artwork() {
  const { slug, artworkId } = useParams()
  const navigate = useNavigate()
  const { project, artwork, index } = getArtwork(slug ?? '', artworkId ?? '')

  const n = project?.artworks.length ?? 0
  const go = useCallback(
    (delta: number) => {
      if (!project || n === 0) return
      const next = project.artworks[(index + delta + n) % n]
      navigate(`/project/${project.slug}/${next.id}`, { replace: true })
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
    <section className={styles.page} data-page="artwork">
      <div className={styles.stage}>
        <button
          type="button"
          className={styles.control}
          onClick={() => go(-1)}
          aria-label="Previous artwork"
        >
          <span className={styles.dim}>◦</span>
          <span className={styles.on}>•</span>
        </button>

        <figure className={styles.frame}>
          <img src={artwork.image} alt={artwork.title} />
          {/* invisible click zones over the image halves */}
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

        <button
          type="button"
          className={styles.control}
          onClick={() => go(1)}
          aria-label="Next artwork"
        >
          <span className={styles.on}>•</span>
          <span className={styles.dim}>◦</span>
        </button>
      </div>

      {(artwork.price || artwork.title) && (
        <div className={styles.meta}>
          {artwork.price && <span className={styles.price}>{artwork.price}</span>}
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
