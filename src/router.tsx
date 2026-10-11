import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
const GalleryGrid = lazy(() => import('./pages/gallery/GalleryGrid'))
const GalleryDetail = lazy(() => import('./pages/gallery/GalleryDetail'))
const About = lazy(() => import('./pages/about/About'))
const Articles = lazy(() => import('./pages/articles/Articles'))
const ArticleDetail = lazy(() => import('./pages/articles/ArticleDetail'))
const Projects = lazy(() => import('./pages/projects/Projects'))
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'))
const Knowledge = lazy(() => import('./pages/knowledge/Knowledge'))
const KnowledgeGraph = lazy(() => import('./pages/knowledge/KnowledgeGraph'))
const KnowledgeDetail = lazy(() => import('./pages/knowledge/KnowledgeDetail'))
const Experience = lazy(() => import('./pages/experience/Experience'))
const Dreams = lazy(() => import('./pages/dreams/Dreams'))
const Friends = lazy(() => import('./pages/friends/Friends'))
const Creator = lazy(() => import('./pages/friends/Creator'))
const Playground = lazy(() => import('./pages/playground/Playground'))
const MiniWorks = lazy(() => import('./pages/playground/MiniWorks'))
const MiniWorkDetail = lazy(() => import('./pages/playground/MiniWorkDetail'))
const ComponentsPreview = lazy(() => import('./pages/dev/ComponentsPreview'))
const CreatureDemo = lazy(() => import('./pages/dev/CreatureDemo'))
const CreatureBuilder = lazy(() => import('./pages/dev/CreatureBuilder'))

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
      { path: 'knowledge', element: <Knowledge /> },
      { path: 'knowledge/graph', element: <KnowledgeGraph /> },
      { path: 'knowledge/:slug', element: <KnowledgeDetail /> },
      { path: 'experience', element: <Experience /> },
      { path: 'playground', element: <Playground /> },
      { path: 'playground/mini-works', element: <MiniWorks /> },
      { path: 'playground/mini-works/:slug', element: <MiniWorkDetail /> },
      { path: 'dreams', element: <Dreams /> },
      { path: 'friends', element: <Friends /> },
      { path: 'friends/create', element: <Creator /> },
      { path: 'dev/components', element: <ComponentsPreview /> },
      { path: 'dev/creature', element: <CreatureDemo /> },
      { path: 'dev/creature-builder', element: <CreatureBuilder /> },
    ],
  },
])
