import { useMemo } from 'react'
import CardGrid from '../components/Content/CardGrid'
import { ProjectCard } from '../components/Content/cards'
import { projects } from '../data/projects'
import { textWidth } from '../lib/measureText'

/**
 * Gallery — projects. Columns 3 → 2 → 1 on desktop, based on whether a card is
 * wide enough for its name+year (12px inset each side + slack), then mobile.
 */
export default function Gallery() {
  const minCardWidth = useMemo(() => {
    const font = "14px 'Inter', system-ui, sans-serif"
    const widest = projects.reduce((m, p) => {
      const w = textWidth(p.title, font) + 12 + textWidth(p.year, font)
      return Math.max(m, w)
    }, 0)
    return Math.ceil(widest) + 24 + 12 // 12px inset each side + 12px slack
  }, [])

  return (
    <CardGrid
      items={projects}
      candidates={[3, 2, 1]}
      minCardWidth={minCardWidth}
      gap={20}
      mobileCols={1}
      renderItem={(p) => <ProjectCard project={p} />}
    />
  )
}
