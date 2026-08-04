import { useParams } from 'react-router-dom'
import CardGrid from '../components/Content/CardGrid'
import { WorkCard } from '../components/Content/cards'
import { getProject } from '../data/projects'
import NotFound from './NotFound'

/**
 * Project — its own Info-text (in the Navigation) + its own artwork cards.
 * Each card is one unit: a 12px name overlaid in the image's bottom-left
 * corner, invisible until hover; on hover the image insets exactly 12px on
 * every side, revealing the corner the name sits in. Cards have a 10px gap
 * both horizontally and vertically. Desktop shrinks 2 → 1 columns (still
 * side-by-side with the Navigation); it only goes to the mobile (stacked)
 * layout once even 1 column's card no longer fits.
 */
export default function Project() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  if (!project) return <NotFound />

  return (
    <CardGrid
      items={project.artworks}
      candidates={[2, 1]}
      minCardWidth={280}
      gap={10}
      mobileCols={2}
      renderItem={(a) => (
        <WorkCard
          artwork={a}
          to={`/project/${project.slug}/${a.id}`}
          descriptionSize={12}
          hoverShrink={12}
        />
      )}
    />
  )
}
