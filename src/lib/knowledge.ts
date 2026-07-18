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
