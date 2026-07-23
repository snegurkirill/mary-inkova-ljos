/**
 * Resolve a public-folder path against the app's base URL so content images
 * work both in dev ('/') and under the GitHub Pages subpath
 * ('/mary-inkova-ljos/'). Vite only rewrites *imported* assets, not string
 * paths kept in data — so those must go through here.
 *
 *   asset('/content/works/1.png')
 *     dev  → '/content/works/1.png'
 *     prod → '/mary-inkova-ljos/content/works/1.png'
 */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
