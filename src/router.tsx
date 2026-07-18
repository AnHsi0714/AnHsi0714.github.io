import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import GalleryGrid from './pages/gallery/GalleryGrid'
import GalleryDetail from './pages/gallery/GalleryDetail'
import About from './pages/about/About'
import Articles from './pages/articles/Articles'
import ArticleDetail from './pages/articles/ArticleDetail'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Experience from './pages/experience/Experience'
import Dreams from './pages/dreams/Dreams'
import Friends from './pages/friends/Friends'
import Creator from './pages/friends/Creator'
import Playground from './pages/playground/Playground'
import ComponentsPreview from './pages/dev/ComponentsPreview'
import CreatureDemo from './pages/dev/CreatureDemo'
import CreatureBuilder from './pages/dev/CreatureBuilder'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'gallery', element: <GalleryGrid /> },
      { path: 'gallery/:slug', element: <GalleryDetail /> },
      { path: 'about', element: <About /> },
      { path: 'articles', element: <Articles /> },
      { path: 'articles/:slug', element: <ArticleDetail /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:slug', element: <ProjectDetail /> },
      { path: 'experience', element: <Experience /> },
      { path: 'playground', element: <Playground /> },
      { path: 'dreams', element: <Dreams /> },
      { path: 'friends', element: <Friends /> },
      { path: 'friends/create', element: <Creator /> },
      { path: 'dev/components', element: <ComponentsPreview /> },
      { path: 'dev/creature', element: <CreatureDemo /> },
      { path: 'dev/creature-builder', element: <CreatureBuilder /> },
    ],
  },
])
