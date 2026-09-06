import { useLanguage, type Language } from "../context/LanguageContext";
import { parseFrontmatter } from "./markdown";
import type { Project, ProjectStatus } from "../types/content";
import projectsDataZh from "../../content/projects.json";
import projectsDataEn from "../../content/projects.en.json";

export const statusBadgeVariant: Record<ProjectStatus, "todo" | "doing" | "done"> = {
  todo: "todo",
  "in-progress": "doing",
  done: "done",
};

const modules = import.meta.glob("../../content/projects/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function baseSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

function isEnglish(path: string): boolean {
  return path.includes("/projects/en/");
}

const zhBodies: Record<string, string> = {};
const enBodies: Record<string, string> = {};

for (const [path, raw] of Object.entries(modules)) {
  const slug = baseSlug(path);
  const body = parseFrontmatter(raw).body;
  if (isEnglish(path)) {
    enBodies[slug] = body;
  } else {
    zhBodies[slug] = body;
  }
}

// slug -> 正文 markdown（沒有對應 .md 檔的專案就只顯示 projects.json 裡的 desc）
// 英文版找不到對應翻譯時 fallback 回中文
export const projectBodiesByLang: Record<Language, Record<string, string>> = {
  zh: zhBodies,
  en: Object.fromEntries(
    Object.keys(zhBodies).map((slug) => [slug, enBodies[slug] ?? zhBodies[slug]]),
  ),
};

export function useProjectBodies(): Record<string, string> {
  const { language } = useLanguage();
  return projectBodiesByLang[language];
}

// projects.json / projects.en.json 用 array index 對應（見 CLAUDE.md），但兩邊的 slug
// 值本身相同，所以查詢時仍能直接用 slug 比對
export const projectsByLang: Record<Language, Project[]> = {
  zh: projectsDataZh as Project[],
  en: projectsDataEn as Project[],
};
