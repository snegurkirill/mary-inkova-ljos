import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../data/types'
import { useColumns } from '../../hooks/useColumns'
import { useMaxLabelWidth } from '../../hooks/useMaxLabelWidth'
import styles from './GalleryShowcase.module.css'

/**
 * Gallery showcase — cards (4:3-ish cover + name + year) linking to a project.
 * Row count is 5 / 3 / 1: it stays high until a card would get too narrow for
 * its name+year to sit on one line with ≥12px of slack, then drops.
 * Always fills the full width; an incomplete last row is centred.
 */
const CANDIDATES = [5, 3, 1]
const LABEL_PADDING = 24 // 12px inset each side of the label row
const SLACK = 12 // required free space before the label would crowd

export default function GalleryShowcase({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const labels = projects.map((p) => ({ name: p.title, year: p.year }))
  const maxLabel = useMaxLabelWidth(labels)
  const minCardWidth = maxLabel + LABEL_PADDING + SLACK
  const cols = useColumns(ref, CANDIDATES, minCardWidth)

  return (
    <div ref={ref} className={styles.showcase}>
      {projects.map((p) => (
        <Link
          key={p.slug}
          to={`/project/${p.slug}`}
          viewTransition
          className={styles.card}
          style={{ flexBasis: `${100 / cols}%` }}
        >
          <div className={styles.cover}>
            <img src={p.cover} alt={p.title} loading="lazy" />
          </div>
          <div className={styles.label}>
            <span className={styles.name}>{p.title}</span>
            <span className={styles.year}>{p.year}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
