import knowledgeDataZh from "../../content/knowledge.json";
import knowledgeDataEn from "../../content/knowledge.en.json";
import type { KnowledgeNode } from "../types/content";
import { useLanguage, type Language } from "../context/LanguageContext";

const knowledgeByLang: Record<Language, Record<string, KnowledgeNode>> = {
  zh: knowledgeDataZh as Record<string, KnowledgeNode>,
  en: knowledgeDataEn as Record<string, KnowledgeNode>,
};

export interface KnowledgeNodeWithSlug extends KnowledgeNode {
  slug: string;
}

// application 可能是單一字串，也可能是 { [專案或文章 slug]: 該情境下的說明 }（同一個詞被多個
// 專案／文章使用，且各自說法不同時）。有 contextSlug 時：
// - application 是物件，對得上該 slug 的 key 才回傳那一句，對不上就回傳空陣列（不要顯示跟目前
//   情境無關的別的專案的說明，例如在 personal-website 頁面點開一個其實只在 code-pulse 用到的詞）
// - application 是單一字串，只有這個詞真的關聯到目前的 slug（在 relatedProjects／relatedArticles
//   裡）才顯示，否則同樣回傳空陣列
// 沒有傳 contextSlug（獨立的知識節點頁）就回傳全部，讓呼叫端各自條列顯示，而不是黏成一段話
// 每一句說明標記它屬於專案還是文章，UI 才能顯示「在此專案中」或「在此文章中」；
// slug 是單句說明對應的那個專案／文章（字串形式的 application 在沒有 contextSlug 時沒有單一對應，留空）
export interface ApplicationEntry {
  kind: "project" | "article";
  slug?: string;
  text: string;
}

export function resolveApplicationEntries(
  entry:
    | Pick<KnowledgeNode, "application" | "relatedProjects" | "relatedArticles">
    | undefined,
  contextSlug?: string,
): ApplicationEntry[] {
  const application = entry?.application;
  if (!application) return [];

  const projects = entry?.relatedProjects ?? [];
  const articles = entry?.relatedArticles ?? [];
  const kindOf = (slug: string): ApplicationEntry["kind"] =>
    articles.includes(slug) && !projects.includes(slug) ? "article" : "project";

  if (typeof application === "string") {
    if (contextSlug) {
      return [...projects, ...articles].includes(contextSlug)
        ? [{ kind: kindOf(contextSlug), slug: contextSlug, text: application }]
        : [];
    }
    if (projects.length === 0 && articles.length === 0) return [];
    return [{ kind: projects.length > 0 ? "project" : "article", text: application }];
  }

  if (contextSlug) {
    return application[contextSlug]
      ? [{ kind: kindOf(contextSlug), slug: contextSlug, text: application[contextSlug] }]
      : [];
  }
  return Object.entries(application)
    .map(([slug, text]) => ({ kind: kindOf(slug), slug, text }))
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "project" ? -1 : 1));
}

function toArray(map: Record<string, KnowledgeNode>): KnowledgeNodeWithSlug[] {
  return Object.entries(map).map(([slug, node]) => ({ slug, ...node }));
}

// 給 Term.tsx 這種「用 slug 查單一詞條」的場景用，直接回傳整個表（含 draft）
export function useKnowledgeMap(): Record<string, KnowledgeNode> {
  const { language } = useLanguage();
  return knowledgeByLang[language];
}

// /knowledge 列表頁與所有反查場景都只看 published，draft 節點在架構上就進不了公開頁面
export function usePublishedKnowledgeNodes(): KnowledgeNodeWithSlug[] {
  const map = useKnowledgeMap();
  return toArray(map).filter((node) => node.status === "published");
}

export function useKnowledgeNode(
  slug: string | undefined,
): KnowledgeNodeWithSlug | undefined {
  const map = useKnowledgeMap();
  if (!slug) return undefined;
  const node = map[slug];
  return node ? { slug, ...node } : undefined;
}

// 專案／文章詳細頁用來反查「哪些知識點的 relatedProjects/relatedArticles 引用了我」
export function useKnowledgeNodesLinkedTo(
  targetType: "project" | "article",
  targetSlug: string,
): KnowledgeNodeWithSlug[] {
  const nodes = usePublishedKnowledgeNodes();
  const field = targetType === "project" ? "relatedProjects" : "relatedArticles";
  return nodes.filter((node) => node[field]?.includes(targetSlug));
}
