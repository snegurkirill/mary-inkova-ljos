import { projects, getProject } from './projects'

/**
 * Top-level menu items (the nav column). Labels stay as authored (RU).
 * `projects` uses «проект» (singular) once a project/artwork is open, else «проекты».
 */
export interface TopItem {
  key: 'projects' | 'works' | 'portraits' | 'collab' | 'about'
  label: string
  to: string
}

export function topItems(insideProject: boolean): TopItem[] {
  return [
    { key: 'projects', label: insideProject ? 'проект' : 'проекты', to: '/gallery' },
    { key: 'works', label: 'работы', to: '/works' },
    { key: 'portraits', label: 'портреты света', to: '/portraits-of-light' },
    { key: 'collab', label: 'коллаборации', to: '/collaboration' },
    { key: 'about', label: 'о художнице', to: '/about' },
  ]
}

export interface MenuItem {
  label: string
  to: string
  selected: boolean
}
export interface MenuColumn {
  items: MenuItem[]
  /** index of the selected item, or -1 if none. */
  selectedIndex: number
}

/** Which top-level key is active for a given path. */
function activeTop(path: string): TopItem['key'] | null {
  if (path === '/' ) return null
  if (path.startsWith('/gallery') || path.startsWith('/project')) return 'projects'
  if (path.startsWith('/works')) return 'works'
  if (path.startsWith('/portraits')) return 'portraits'
  if (path.startsWith('/collaboration')) return 'collab'
  if (path.startsWith('/about')) return 'about'
  return null
}

/** Parse /project/:slug and /project/:slug/:artworkId out of a path. */
function projectParts(path: string): { slug?: string; artworkId?: string } {
  const p = path.replace(/^\/+|\/+$/g, '').split('/')
  if (p[0] === 'project') return { slug: p[1], artworkId: p[2] }
  return {}
}

/**
 * Build the Miller columns for the current path:
 *  - column 0: the top-level nav
 *  - column 1: the project list        (only inside /project/*)
 *  - column 2: the artwork list         (only inside /project/:slug/:artworkId)
 * The LAST column is the "current" level (rendered gray, 16px); earlier columns
 * are parents (blue, 14px then 12px).
 */
export function buildColumns(path: string): MenuColumn[] {
  const { slug, artworkId } = projectParts(path)
  const insideProject = Boolean(slug)
  const active = activeTop(path)

  const nav = topItems(insideProject)
  const navCol: MenuColumn = {
    items: nav.map((t) => ({ label: t.label, to: t.to, selected: t.key === active })),
    selectedIndex: nav.findIndex((t) => t.key === active),
  }
  const columns: MenuColumn[] = [navCol]

  if (insideProject) {
    const projItems = projects.map((p) => ({
      label: p.title,
      to: `/project/${p.slug}`,
      selected: p.slug === slug,
    }))
    columns.push({
      items: projItems,
      selectedIndex: projItems.findIndex((i) => i.selected),
    })

    if (artworkId) {
      const project = getProject(slug!)
      const artItems =
        project?.artworks.map((a) => ({
          label: a.title,
          to: `/project/${slug}/${a.id}`,
          selected: a.id === artworkId,
        })) ?? []
      columns.push({
        items: artItems,
        selectedIndex: artItems.findIndex((i) => i.selected),
      })
    }
  }

  return columns
}
