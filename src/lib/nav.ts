/** Route helpers for page transitions. */

/** True for an Artwork route: /project/:slug/:artworkId (3 segments). */
export function isArtworkPath(path: string): boolean {
  const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  return parts.length === 3 && parts[0] === 'project'
}

/** Every navigation crossfades (View Transitions), including between artworks. */
export function shouldFade(_from: string, _to: string): boolean {
  return true
}
