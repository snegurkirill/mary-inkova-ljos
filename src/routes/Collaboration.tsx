import CardGrid from '../components/Content/CardGrid'
import { ArtworkCard } from '../components/Content/cards'
import { allArtworks } from '../data/projects'

/**
 * «коллаборации» — same layout as Project (2 columns → 1, gap 10px), but the
 * Navigation Info-text stays empty. No real content yet — uses all artworks
 * as placeholders.
 */
export default function Collaboration() {
  const items = allArtworks()
  return (
    <CardGrid
      items={items}
      candidates={[2]}
      minCardWidth={300}
      gap={10}
      mobileCols={1}
      renderItem={(a) => (
        <ArtworkCard artwork={a} to={`/project/${a.projectSlug}/${a.id}`} />
      )}
    />
  )
}
