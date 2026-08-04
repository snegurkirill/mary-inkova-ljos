import styles from './GradientFilterOverlay.module.css'

/**
 * Duotone (white → #5CA3FF → white) gradient-map overlay for a single photo.
 * Drop it as a sibling right after the real <img>, inside the same
 * position:relative box that image already sits in. Invisible at rest; fades
 * in while the page is scrolling, fades out when it stops.
 */
export default function GradientFilterOverlay({ src }: { src: string }) {
  return (
    <div
      className={styles.overlay}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  )
}
