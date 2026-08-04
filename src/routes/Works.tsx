import CardGrid from '../components/Content/CardGrid'
import { WorkCard } from '../components/Content/cards'
import { allArtworks } from '../data/projects'

/**
 * «работы» — a flat grid of every work. Cards match the Project page's card
 * design (same image treatment) but with no name/description at all — just
 * the image. Always 3 columns, 10px gap both horizontally and vertically.
 */
export default function Works() {
  const works = allArtworks()
  return (
    <CardGrid
      items={works}
      candidates={[3]}
      minCardWidth={140}
      gap={10}
      mobileCols={3}
      renderItem={(a) => (
        <WorkCard
          artwork={a}
          to={`/project/${a.projectSlug}/${a.id}`}
          showDescription={false}
        />
      )}
    />
  )
}
