import { parseFrontmatter } from "./markdown";

const modules = import.meta.glob("../../content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

// slug -> 正文 markdown（沒有對應 .md 檔的專案就只顯示 projects.json 裡的 desc）
export const projectBodies: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    return [slug, parseFrontmatter(raw).body];
  }),
);
