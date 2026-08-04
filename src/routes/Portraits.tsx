import CardGrid from '../components/Content/CardGrid'
import { PhotoCard } from '../components/Content/cards'
import { portraits } from '../data/portraits'

/** «портреты света» — flat 2-column photo grid (no titles). Gap 10px. */
export default function Portraits() {
  return (
    <CardGrid
      items={portraits}
      candidates={[2, 1]}
      minCardWidth={220}
      gap={10}
      mobileCols={1}
      renderItem={(src) => <PhotoCard src={src} />}
    />
  )
}
