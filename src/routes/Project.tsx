import { useParams } from 'react-router-dom'
import ProjectShowcase from '../components/Showcase/ProjectShowcase'
import { getProject } from '../data/projects'
import NotFound from './NotFound'
import styles from './Project.module.css'

/** Project — scrollable. Showcase of artworks (5 / 3 rows) + description block. */
export default function Project() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  if (!project) return <NotFound />

  return (
    <section className={styles.page} data-page="project">
      <ProjectShowcase project={project} />
    </section>
  )
}
