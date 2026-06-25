import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import GalleryGrid from './pages/gallery/GalleryGrid'
import GalleryDetail from './pages/gallery/GalleryDetail'
import About from './pages/about/About'
import Articles from './pages/articles/Articles'
import Projects from './pages/projects/Projects'
import Dreams from './pages/dreams/Dreams'
import Friends from './pages/friends/Friends'
import ComponentsPreview from './pages/dev/ComponentsPreview'

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
      { path: 'projects', element: <Projects /> },
      { path: 'dreams', element: <Dreams /> },
      { path: 'friends', element: <Friends /> },
      { path: 'dev/components', element: <ComponentsPreview /> },
    ],
  },
])
