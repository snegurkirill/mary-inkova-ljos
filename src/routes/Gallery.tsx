import { useMemo } from 'react'
import CardGrid from '../components/Content/CardGrid'
import { ProjectCard } from '../components/Content/cards'
import { projects } from '../data/projects'
import { textWidth } from '../lib/measureText'

/**
 * Gallery — projects. Columns 3 → 2 → 1 on desktop, based on whether a card is
 * wide enough for its name (overlaid in the cover's bottom-left corner, 12px
 * inset each side + slack), then mobile.
 */
export default function Gallery() {
  const minCardWidth = useMemo(() => {
    const font = "14px 'Inter', system-ui, sans-serif"
    const widest = projects.reduce((m, p) => Math.max(m, textWidth(p.title, font)), 0)
    return Math.ceil(widest) + 24 + 12 // 12px inset each side + 12px slack
  }, [])

  return (
    <CardGrid
      items={projects}
      candidates={[3, 2, 1]}
      minCardWidth={minCardWidth}
      gap={20}
      padding={10}
      mobileCols={1}
      renderItem={(p) => <ProjectCard project={p} />}
    />
  )
}
