import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LensSphere from '../components/LensSphere/LensSphere'
import { useLayout } from '../components/Layout/LayoutContext'
import { asset } from '../lib/asset'
import styles from './Home.module.css'

const POEM =
  'Есть место — оно парит выше звёзд, это мой дом, он наполнен проникающим светом'

/**
 * Home. Desktop: the message (poem) shows in full on the right; the preview
 * sphere between the Navigation and the message expands/shrinks to fit. Once
 * the sphere would be narrower than 320px we go mobile (reported to Layout):
 * header on top, sphere in the middle, message at the bottom (42px up).
 * Clicking the sphere image opens the Gallery.
 */
const POEM_WIDTH = 320
const SPHERE_MIN = 320
const GAP = 40

export default function Home() {
  const { isMobile, setMinContent } = useLayout()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    setMinContent(SPHERE_MIN + GAP + POEM_WIDTH)
  }, [setMinContent])

  return (
    <section
      className={`${styles.page} ${isMobile ? styles.mobile : ''}`}
      data-page="home"
    >
      <button
        type="button"
        className={styles.sphere}
        onClick={() => navigate('/gallery', { viewTransition: true })}
        aria-label="Open gallery"
      >
        <div className={styles.sphereInner}>
          <LensSphere src={asset('/content/home/lens.mp4')} />
        </div>
      </button>
      <p className={styles.poem}>{POEM}</p>
    </section>
  )
}
