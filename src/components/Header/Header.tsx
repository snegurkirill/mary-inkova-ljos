import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import wordmark from '../../assets/wordmark.svg'
import { getProject, getArtwork } from '../../data/projects'
import { shouldFade } from '../../lib/nav'
import styles from './Header.module.css'

/**
 * Site identity + positioning. Centred, fixed to the top with 32px above.
 * The Header IS the navigation: it shows where you are and, on click of the
 * wordmark, moves one level up ("previous page state").
 *
 * States (from Figma "Development" → Header component):
 *  - home:       logo only; after the intro reveal finishes it shifts to
 *                "welcoming" — logo + both labels [проекты · об авторе] unselected.
 *  - gallery:    logo + nav [проекты · об авторе]           (проекты active)
 *  - about:      logo + nav [проекты · об авторе]           (об авторе active)
 *  - project:    logo + nav [проект · об авторе] + project title
 *  - artwork:    logo + [project · artwork subtitle] + [medium · size]
 */

// Matches the Home reveal timing (see --reveal-step / --reveal-dur):
// last poem line = 7 * 500ms stagger + 1000ms fade ≈ 4.5s.
const REVEAL_TOTAL_MS = 4500

type Level =
  | { kind: 'home' }
  | { kind: 'gallery' }
  | { kind: 'about' }
  | { kind: 'project'; slug: string }
  | { kind: 'artwork'; slug: string; artworkId: string }

function parseLevel(pathname: string): Level {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (parts.length === 0) return { kind: 'home' }
  if (parts[0] === 'about') return { kind: 'about' }
  if (parts[0] === 'gallery') return { kind: 'gallery' }
  if (parts[0] === 'project') {
    if (parts[2]) return { kind: 'artwork', slug: parts[1], artworkId: parts[2] }
    if (parts[1]) return { kind: 'project', slug: parts[1] }
  }
  return { kind: 'home' }
}

/** Where the wordmark takes you — one level up the hierarchy. */
function upHref(level: Level): string {
  switch (level.kind) {
    case 'artwork':
      return `/project/${level.slug}`
    case 'project':
      return '/gallery'
    case 'gallery':
    case 'about':
      return '/'
    default:
      return '/'
  }
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const level = parseLevel(location.pathname)

  // On Home, reveal the welcoming nav once the intro finishes.
  const [welcoming, setWelcoming] = useState(false)
  useEffect(() => {
    if (level.kind !== 'home') {
      setWelcoming(false)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setWelcoming(true)
      return
    }
    setWelcoming(false)
    const t = setTimeout(() => setWelcoming(true), REVEAL_TOTAL_MS)
    return () => clearTimeout(t)
  }, [level.kind])

  const onWordmark = () => {
    // On Home the whole surface is an "enter" gesture → Gallery.
    if (level.kind === 'home') {
      navigate('/gallery', { viewTransition: true })
      return
    }
    const to = upHref(level)
    navigate(to, { viewTransition: shouldFade(location.pathname, to) })
  }

  return (
    <header
      className={`${styles.header} ${level.kind === 'home' ? styles.reveal : ''}`}
    >
      <button
        type="button"
        className={styles.wordmark}
        onClick={onWordmark}
        aria-label={level.kind === 'home' ? 'Mary Inkova Ljós — enter' : 'Mary Inkova Ljós — back'}
      >
        <img src={wordmark} alt="Mary Inkova Ljós" width={245} height={32} />
      </button>

      <HeaderContext level={level} welcoming={welcoming} />
    </header>
  )
}

/** Top-level nav. `active` undefined = welcoming (both unselected). */
function Nav({
  active,
  enter,
}: {
  active?: 'projects' | 'about'
  enter?: boolean
}) {
  const cls = (self: 'projects' | 'about') =>
    active === self ? styles.navActive : active ? styles.navMuted : styles.navWelcome

  return (
    <nav className={`${styles.nav} ${enter ? styles.navEnter : ''}`}>
      <Link to="/gallery" viewTransition className={cls('projects')}>
        проекты
      </Link>
      <Link to="/about" viewTransition className={cls('about')}>
        об авторе
      </Link>
    </nav>
  )
}

function HeaderContext({
  level,
  welcoming,
}: {
  level: Level
  welcoming: boolean
}) {
  if (level.kind === 'home') return welcoming ? <Nav enter /> : null

  if (level.kind === 'gallery') return <Nav active="projects" />
  if (level.kind === 'about') return <Nav active="about" />

  if (level.kind === 'project') {
    const project = getProject(level.slug)
    return (
      <>
        <Nav active="projects" />
        <div className={styles.crumb}>
          <span className={styles.crumbInk}>{project?.title ?? level.slug}</span>
        </div>
      </>
    )
  }

  // artwork — instant navigations, so the crumb link doesn't fade
  const { project, artwork } = getArtwork(level.slug, level.artworkId)
  return (
    <>
      <div className={styles.crumb}>
        <Link to={`/project/${level.slug}`} className={styles.crumbInk}>
          {project?.title ?? level.slug}
        </Link>
        {artwork?.title && (
          <span className={styles.crumbSub}>{artwork.title}</span>
        )}
      </div>
      {(artwork?.technique || artwork?.size) && (
        <div className={styles.params}>
          {artwork.technique && <span>{artwork.technique}</span>}
          {artwork.size && <span>{artwork.size}</span>}
        </div>
      )}
    </>
  )
}
