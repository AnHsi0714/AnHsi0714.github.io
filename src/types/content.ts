export type DreamStatus = 'todo' | 'doing' | 'done'

export interface Dream {
  title: string
  status: DreamStatus
  desc: string
}

export interface Project {
  name: string
  desc: string
  screenshotUrl?: string
  githubUrl?: string
}

export interface Book {
  slug: string
  title: string
  author: string
  rating: number
  finishedOn: string
  excerpt: string
  categories: string[]
  coverUrl?: string
}
