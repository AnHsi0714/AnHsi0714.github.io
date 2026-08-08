function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseListField(value: string): string[] {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => unquote(item.trim()))
    .filter(Boolean);
}

// 只支援 frontmatter 需要的扁平 key: value（含 [a, b] 陣列），不是完整 YAML
export function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
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

// 文章目錄只收錄 h2~h4；h1 保留給文章標題本身，不會出現在正文裡
export type MarkdownHeadingLevel = 2 | 3 | 4;

export interface MarkdownHeading {
  id: string;
  text: string;
  level: MarkdownHeadingLevel;
}

// 只留字母/數字/CJK 與空白，其餘標點一律拿掉，避免產生的 id 裡出現需要跳脫的符號。
// 匯出給 MarkdownContent 的標題 renderer 直接複用，兩邊各自對「同一段標題文字」
// 呼叫這個純函式算 id，而不是共用一個渲染時遞增的計數器——後者在 StrictMode 下
// 因為每個節點的 render 會被重複呼叫，計數器會被多算，導致 id 對不上標題
export function slugifyHeadingText(text: string): string {
  const cleaned = text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned || "section";
}

// 掃描 ##〜#### 標題產生目錄清單。id 只由標題文字本身決定（不做重複標題的序號消歧），
// 這樣才能跟 MarkdownContent 那邊「只憑自己的文字算 id」的純函式邏輯保持一致
export function extractHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  let inCodeBlock = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (!match) continue;

    const level = match[1].length as MarkdownHeadingLevel;
    const text = match[2].trim();
    headings.push({ id: slugifyHeadingText(text), text, level });
  }

  return headings;
}

// 從 markdown 正文自動產生摘要：去掉圖片/連結/標題語法，取前 maxLen 字
export function deriveExcerpt(markdown: string, maxLen = 100): string {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen)}…`;
}
