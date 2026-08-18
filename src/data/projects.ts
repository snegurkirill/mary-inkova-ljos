import type { Project } from './types'
import { asset } from '../lib/asset'

/**
 * DEMO content — wired to the images currently in the repo so every page is
 * demonstrable. Replace with the artist's real projects/artworks (or generate
 * this file from a GitHub-based CMS later). Titles kept mixed EN/RU as authored.
 */

const W = (n: number) => asset(`/content/works/${n}.png`)

// Gallery-card cover: the cloud-preview collage (scripts/cloud-preview.py),
// shared across every project for now (demo content reuses one artwork set).
const GALLERY_PREVIEW = asset('/content/gallery-preview.jpg')

const glowingFlowersArtworks = [
  { id: '1', title: 'Хлеборус и 4 лепестка', image: W(1), technique: 'Фотография, lumen print', size: '30 х 40', price: '15 000 ₽', medium: 'Photo' as const },
  { id: '2', title: 'Полярное сияние', image: W(2), technique: 'Фотография, lumen print', size: '30 х 40', price: '15 000 ₽', medium: 'Photo' as const },
  { id: '3', title: 'Письмо света', image: W(3), technique: 'Фотография, lumen print', size: '40 х 50', price: '18 000 ₽', medium: 'Photo' as const },
  { id: '4', title: 'Объект света', image: W(4), technique: 'Фотография, lumen print', size: '30 х 40', price: '15 000 ₽', medium: 'Photo' as const },
  { id: '5', title: 'Резонанс солнца', image: W(5), technique: 'Фотография, lumen print', size: '50 х 70', price: '24 000 ₽', medium: 'Photo' as const },
  { id: '6', title: 'Соленые ресницы', image: W(6), technique: 'Фотография, lumen print', size: '30 х 40', price: '15 000 ₽', medium: 'Photo' as const },
  { id: '7', title: 'Дух белой ночи', image: W(7), technique: 'Фотография, lumen print', size: '40 х 50', price: '18 000 ₽', medium: 'Photo' as const },
  { id: '8', title: 'Внутренние наблюдения', image: W(8), technique: 'Фотография, lumen print', size: '30 х 40', price: '15 000 ₽', medium: 'Photo' as const },
  { id: '9', title: 'Magic Optic Color', image: W(9), technique: 'Фотография, lumen print', size: '50 х 70', price: '24 000 ₽', medium: 'Photo' as const },
]

const description = `«Сияющие цветы» (glowing flowers series) — это исследование внутреннего света растений и попытка проявить невидимое. Через светочувствительный материал и взаимодействие с солнцем раскрывается их тонкая метафизическая природа — световое тело, душа цветка.

Каждый отпечаток уникален: цвет зависит от влаги в цветке и качества бумаги, а также от яркости солнечного света. В этом процессе важны непредсказуемость и отказ от контроля — в этом и рождается настоящее волшебство.

Работы становятся маленькими светящимися формами — цветами-маяками.`

export const projects: Project[] = [
  { slug: 'glowing-flowers', title: 'Glowing Flowers', year: '2026', cover: GALLERY_PREVIEW, description, medium: 'Photo', artworks: glowingFlowersArtworks },
  { slug: 'lucida-morgana', title: 'Lucida Morgana', year: '2025', cover: GALLERY_PREVIEW, description, medium: 'Space', artworks: glowingFlowersArtworks },
  { slug: 'sun-resonance', title: 'Sun Resonance', year: '2024', cover: GALLERY_PREVIEW, description, medium: 'Photo', artworks: glowingFlowersArtworks },
  { slug: 'polarized-world', title: 'Polarized world', year: '2023', cover: GALLERY_PREVIEW, description, medium: 'Photo', artworks: glowingFlowersArtworks },
  { slug: 'objects-of-light', title: 'Objects of Light', year: '2022', cover: GALLERY_PREVIEW, description, medium: 'Space', artworks: glowingFlowersArtworks },
  { slug: 'spirit-of-white-night', title: 'Spirit of white night', year: '2021', cover: GALLERY_PREVIEW, description, medium: 'Video', artworks: glowingFlowersArtworks },
  { slug: 'magic-optic-color', title: 'Magic Optic Color', year: '2020', cover: GALLERY_PREVIEW, description, medium: 'Photo', artworks: glowingFlowersArtworks },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

/** Flat list of every artwork across projects — for the «работы» page. */
export function allArtworks() {
  return projects.flatMap((p) =>
    p.artworks.map((a) => ({ ...a, projectSlug: p.slug })),
  )
}

export function getArtwork(slug: string, artworkId: string) {
  const project = getProject(slug)
  const index = project?.artworks.findIndex((a) => a.id === artworkId) ?? -1
  const artwork = index >= 0 ? project!.artworks[index] : undefined
  return { project, artwork, index }
}
