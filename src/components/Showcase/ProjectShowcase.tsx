import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../data/types'
import styles from './ProjectShowcase.module.css'

/**
 * Project showcase — 3:4 artwork cards (10px gaps) linking to Artwork pages,
 * with a project-description block occupying the 3rd cell.
 *
 * Columns are 5 or 3: cards fill the width and stay at 5 while each card is
 * wider than the header (~245px); once a 5-wide card would be narrower than
 * the header, it drops to 3. In the 3-column state the description block moves
 * out of the grid to sit above it.
 */
const GAP = 10
const HEADER_WIDTH = 245 // wordmark width — the switch threshold
const DESC_INDEX = 2 // 3rd cell

export default function ProjectShowcase({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(5)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const compute = () => {
      const w = el.clientWidth
      if (!w) return
      const cardAt5 = (w - 4 * GAP) / 5
      setCols(cardAt5 >= HEADER_WIDTH ? 5 : 3)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const description = (
    <p className={styles.description}>{project.description}</p>
  )

  // In 5-col mode the description is the 3rd cell; in 3-col it moves above.
  const cells: ({ kind: 'desc' } | { kind: 'art'; index: number })[] = []
  project.artworks.forEach((_, i) => cells.push({ kind: 'art', index: i }))
  if (cols === 5) cells.splice(DESC_INDEX, 0, { kind: 'desc' })

  return (
    <div ref={ref} className={styles.wrap}>
      {cols === 3 && <div className={styles.descAbove}>{description}</div>}

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map((cell, i) =>
          cell.kind === 'desc' ? (
            <div key={`desc-${i}`} className={styles.descCell}>
              {description}
            </div>
          ) : (
            <Link
              key={project.artworks[cell.index].id}
              to={`/project/${project.slug}/${project.artworks[cell.index].id}`}
              className={styles.card}
            >
              <img
                src={project.artworks[cell.index].image}
                alt={project.artworks[cell.index].title}
                loading="lazy"
              />
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
