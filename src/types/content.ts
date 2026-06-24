export interface Dream {
  title: string
  desc: string
}

export type ProjectStatus = 'in-progress' | 'done'

export interface Project {
  name: string
  desc: string
  status: ProjectStatus
  screenshotUrl?: string
  githubUrl?: string
}

export type ArticleType = 'book' | 'note'

export interface Article {
  slug: string
  type: ArticleType
  title: string
  date: string
  excerpt: string
  categories: string[]
  coverUrl?: string
  // 僅 type: 'book' 會用到
  author?: string
  rating?: number
}
