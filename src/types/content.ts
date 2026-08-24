import type { ChipVariant } from "../components/Chip";

export interface Dream {
  title: string;
  desc: string;
  progress?: {
    current: number;
    target: number;
    unit?: string;
  };
}

export type ProjectStatus = "todo" | "in-progress" | "done";

export type ProjectTag =
  | "NLP"
  | "AI"
  | "OOP"
  | "GAME"
  | "WEB"
  | "DB"
  | "VIZ"
  | "EDU"
  | "DATA";

export interface Project {
  slug: string;
  name: string;
  desc: string;
  date: string;
  status: ProjectStatus;
  tags: ProjectTag[];
  collaborators?: string[];
  period?: string;
  advisor?: string;
  screenshotUrl?: string;
  // 縮圖裁切錨點（百分比，0~100）。w/h 對應 object-position 的 x/y，預設置中 (50, 50)
  screenshotPosition?: { w: number; h: number };
  githubUrl?: string;
  // 站長手動置頂／精選，會排在列表最前面並顯示圖釘圖示
  featured?: boolean;
}

export interface ExperienceTag {
  label: string;
  variant: ChipVariant;
}

export interface ExperienceEntry {
  period: string;
  title: string;
  subtitle?: string;
  tags: ExperienceTag[];
  highlights: string[];
}

export interface SecondaryExperienceEntry {
  period: string;
  title: string;
  result: string;
  tags: ExperienceTag[];
}

export interface Artwork {
  slug: string;
  title: string;
  date: string;
  // public/gallery/ 下的截圖；展場載入時隨機挑一張，呼應生成式作品每次執行都不一樣
  images: string[];
  openProcessingUrl: string;
  // 作品介紹；有寫的作品，展牆名牌會變成可點擊、展開「美術館說明牌」彈窗
  description?: string;
}

export type KnowledgeStatus = "draft" | "published";

export type KnowledgeRelationType =
  | "prerequisite"
  | "related"
  | "applies_to"
  | "contrasts_with";

export interface KnowledgeRelatedNode {
  slug: string;
  type: KnowledgeRelationType;
}

export interface KnowledgeNode {
  term: string;
  definition: string;
  // 這個詞彙在專案裡實際如何被應用，非通用字典解釋；沒有對應專案的純知識點可留空
  application?: string;
  // 分類代碼沿用 ProjectTag 的簡短風格（ALGO/NLP/DB/WEB/EVAL...），不強制列舉，允許之後自由擴充
  category: string;
  status: KnowledgeStatus;
  relatedProjects?: string[];
  relatedArticles?: string[];
  relatedNodes?: KnowledgeRelatedNode[];
}

export interface NameCardContent {
  name: string;
  nameEnglish: string;
  job: string;
  about: string;
  caption: string;
}

export type ArticleType = "book" | "essay" | "paper" | "tech" | "journal";

// draft 文章不會出現在 /articles 列表、「下一篇文章」或知識點反查，但仍可透過直接網址預覽
export type ArticleStatus = "draft" | "published";

export interface Article {
  slug: string;
  type: ArticleType;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  categories: string[];
  coverUrl?: string;
  // 僅 type: 'book' / 'essay' 會用到
  author?: string;
  rating?: number;
  // 站長手動置頂／精選，會排在列表最前面並顯示圖釘圖示
  featured?: boolean;
  status: ArticleStatus;
  // 手動指定「下一篇文章」的 slug，蓋過預設的依日期排序取下一篇；
  // 沒填或指向的文章不存在／未上架時，一律 fallback 回預設排序邏輯
  nextSlug?: string;
}
