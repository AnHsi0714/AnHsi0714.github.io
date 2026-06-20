import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import GalleryGrid from './pages/gallery/GalleryGrid'
import GalleryDetail from './pages/gallery/GalleryDetail'
import Life from './pages/life/Life'
import Books from './pages/books/Books'
import Projects from './pages/projects/Projects'
import Dreams from './pages/dreams/Dreams'
import Tasks from './pages/tasks/Tasks'
import Friends from './pages/friends/Friends'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'gallery', element: <GalleryGrid /> },
      { path: 'gallery/:slug', element: <GalleryDetail /> },
      { path: 'life', element: <Life /> },
      { path: 'books', element: <Books /> },
      { path: 'projects', element: <Projects /> },
      { path: 'dreams', element: <Dreams /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'friends', element: <Friends /> },
    ],
  },
])
