import type { Article, ArticleType } from "../types/content";
import { deriveExcerpt, parseFrontmatter, parseListField } from "./markdown";

const modules = import.meta.glob("../../content/articles/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const articles: Article[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(raw);
    return {
      slug,
      type: (data.type as ArticleType) || "note",
      title: data.title ?? slug,
      date: data.date ?? "",
      categories: data.categories ? parseListField(data.categories) : [],
      excerpt: data.excerpt || deriveExcerpt(body),
      body,
      coverUrl: data.coverUrl || undefined,
      author: data.author || undefined,
      rating: data.rating ? Number(data.rating) : undefined,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));
