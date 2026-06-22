import type { Book } from "../types/content";

const modules = import.meta.glob("../../content/books/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseCategories(value: string): string[] {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => unquote(item.trim()))
    .filter(Boolean);
}

// 只支援 frontmatter 需要的扁平 key: value（含 [a, b] 陣列），不是完整 YAML
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };

  const [, frontmatter, body] = match;
  const data: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const lineMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!lineMatch) continue;
    data[lineMatch[1]] = unquote(lineMatch[2].trim());
  }
  return { data, body: body.trim() };
}

export const books: Book[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      author: data.author ?? "",
      rating: Number(data.rating) || 0,
      finishedOn: data.finishedOn ?? "",
      categories: data.categories ? parseCategories(data.categories) : [],
      excerpt: body,
      coverUrl: data.coverUrl || undefined,
    };
  })
  .sort((a, b) => b.finishedOn.localeCompare(a.finishedOn));
