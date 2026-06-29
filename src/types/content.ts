export interface Dream {
  title: string
  desc: string
  progress?: {
    current: number
    target: number
    unit?: string
  }
}

export interface FriendCreation {
  id: number
  nickname: string
  intro?: string
  imageUrl?: string
}

export type ProjectStatus = 'in-progress' | 'done'

export interface Project {
  slug: string
  name: string
  desc: string
  status: ProjectStatus
  screenshotUrl?: string
  // 縮圖裁切錨點（百分比，0~100）。w/h 對應 object-position 的 x/y，預設置中 (50, 50)
  screenshotPosition?: { w: number; h: number }
  githubUrl?: string
}

export type ArticleType = 'book' | 'note'

export interface Article {
  slug: string
  type: ArticleType
  title: string
  date: string
  excerpt: string
  body: string
  categories: string[]
  coverUrl?: string
  // 僅 type: 'book' 會用到
  author?: string
  rating?: number
}
