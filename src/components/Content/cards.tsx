import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import GradientFilterOverlay from '../GradientFilter/GradientFilterOverlay'
import type { Project, Artwork } from '../../data/types'
import styles from './cards.module.css'

/** Gallery project card: 4:3 cover + name + year (unchanged from v1). */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/project/${project.slug}`} viewTransition className={styles.card}>
      <div className={styles.cover}>
        <img src={project.cover} alt={project.title} loading="lazy" />
        <GradientFilterOverlay src={project.cover} />
      </div>
      <div className={styles.label}>
        <span className={styles.name}>{project.title}</span>
        <span className={styles.year}>{project.year}</span>
      </div>
    </Link>
  )
}

/** Project/Artworks/Collaboration artwork card: 3:4 image + art-work-name. */
export function ArtworkCard({
  artwork,
  to,
}: {
  artwork: Artwork
  to: string
}) {
  return (
    <Link to={to} viewTransition className={styles.card}>
      <div className={styles.artImage}>
        <img src={artwork.image} alt={artwork.title} loading="lazy" />
        <GradientFilterOverlay src={artwork.image} />
      </div>
      <div className={styles.artName}>{artwork.title}</div>
    </Link>
  )
}

/**
 * Works/Project card: image and name are one unit — the name is overlaid on
 * the image, flush in its bottom-left corner. On hover the image insets by
 * exactly `hoverShrink` px on every side (a plain `inset` change — uniform on
 * all 4 sides, so it can never shift, only shrink), which reveals its own
 * corner for the name to sit in. `descriptionSize` sets the name's font size
 * (px). `hoverReveal` (default true, the Project page's behaviour) keeps the
 * name invisible until hover; set it false to show it always, with no hover
 * interaction at all. `showDescription` (default true) omits the name
 * entirely when false — just the image.
 */
export function WorkCard({
  artwork,
  to,
  descriptionSize = 10,
  hoverShrink = 0,
  hoverReveal = true,
  showDescription = true,
}: {
  artwork: Artwork
  to: string
  descriptionSize?: number
  hoverShrink?: number
  hoverReveal?: boolean
  showDescription?: boolean
}) {
  return (
    <Link
      to={to}
      viewTransition
      className={`${styles.card} ${styles.workCard} ${hoverReveal ? '' : styles.workDescStatic}`}
      style={
        {
          '--work-desc-size': `${descriptionSize}px`,
          '--work-hover-inset': `${hoverShrink}px`,
        } as CSSProperties
      }
    >
      <div className={styles.artImage}>
        <div className={styles.artImageFrame}>
          <img src={artwork.image} alt={artwork.title} loading="lazy" />
          <GradientFilterOverlay src={artwork.image} />
        </div>
        {showDescription && (
          <div className={styles.workDesc}>{artwork.title}</div>
        )}
      </div>
    </Link>
  )
}

/** Portraits-of-light photo (no title). */
export function PhotoCard({ src }: { src: string }) {
  return (
    <div className={styles.photo}>
      <img src={src} alt="" loading="lazy" />
      <GradientFilterOverlay src={src} />
    </div>
  )
}
