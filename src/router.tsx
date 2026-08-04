import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './routes/Home'
import Gallery from './routes/Gallery'
import Project from './routes/Project'
import Artwork from './routes/Artwork'
import Works from './routes/Works'
import Portraits from './routes/Portraits'
import Collaboration from './routes/Collaboration'
import About from './routes/About'
import NotFound from './routes/NotFound'

/**
 * Data router (createBrowserRouter) — required for the View Transitions
 * integration used for page crossfades. `basename` picks up Vite's BASE_URL
 * so it works under the GitHub Pages subpath.
 */
export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'gallery', element: <Gallery /> },
        { path: 'project/:slug', element: <Project /> },
        { path: 'project/:slug/:artworkId', element: <Artwork /> },
        { path: 'works', element: <Works /> },
        { path: 'portraits-of-light', element: <Portraits /> },
        { path: 'collaboration', element: <Collaboration /> },
        { path: 'about', element: <About /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
