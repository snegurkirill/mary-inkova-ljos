/**
 * Content model for the Mary Inkova Ljós portfolio.
 *
 * Content is authored as typed data + images under `public/content/`.
 * Shape is intentionally simple so a GitHub-based CMS can later generate
 * `projects.ts` from folders named per project.
 */

export type Medium = 'Photo' | 'Video' | 'Space'

export interface Artwork {
  /** Stable id, unique within its project. Used in the URL. */
  id: string
  /** Artwork title / subtitle, e.g. «Хлеборус и 4 лепестка». */
  title: string
  /** Path served from /public, e.g. "/content/works/1.png". */
  image: string
  /** Free-form technique, e.g. «Фотография, lumen print». */
  technique?: string
  /** Physical size, e.g. «30 х 40». */
  size?: string
  /** Price label, e.g. «15 000 ₽». Omit if not for sale. */
  price?: string
  medium?: Medium
}

export interface Project {
  /** URL slug, unique across the site. */
  slug: string
  title: string
  year: string
  /** Album cover shown in the Gallery showcase (4:3-ish). */
  cover: string
  /** Shown in the Project showcase description block. */
  description: string
  medium?: Medium
  artworks: Artwork[]
}
