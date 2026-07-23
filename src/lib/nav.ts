/** Route helpers for page transitions. */

/** True for an Artwork route: /project/:slug/:artworkId (3 segments). */
export function isArtworkPath(path: string): boolean {
  const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  return parts.length === 3 && parts[0] === 'project'
}

/**
 * Crossfade only between the main pages (home, gallery, project, about).
 * Any navigation touching an Artwork route stays instant (slider + entering/
 * leaving an artwork).
 */
export function shouldFade(from: string, to: string): boolean {
  return !isArtworkPath(from) && !isArtworkPath(to)
}
