import type { ArticleType } from "../types/content";

// 每分鐘閱讀量：中文看字、英文看詞，兩種文字在同一篇裡常混用，所以分開計數再相加
const ZH_CHARS_PER_MINUTE = 450;
const EN_WORDS_PER_MINUTE = 220;

// 概念密度高的類型要停下來回頭讀，用倍率拉長時間；沒資料可以逐類校準，所以只調有明顯差異的
const TYPE_MULTIPLIER: Record<ArticleType, number> = {
  paper: 1.4,
  tech: 1.2,
  journal: 1,
  essay: 1,
  book: 1,
};

// 圖、表、程式碼不是「讀」出來的，各自加固定秒數
const SECONDS_PER_IMAGE = 10;
const SECONDS_PER_TABLE = 20;
const SECONDS_PER_CODE_BLOCK = 20;

export function estimateReadingMinutes(body: string, type: ArticleType): number {
  const codeBlocks = body.match(/^```[\s\S]*?^```/gm)?.length ?? 0;
  const withoutCode = body.replace(/^```[\s\S]*?^```/gm, "");

  const tableBlocks = withoutCode.match(/(?:^\|.*\|[ \t]*\r?\n?)+/gm)?.length ?? 0;
  const images = withoutCode.match(/!\[[^\]]*\]\([^)]*\)/g)?.length ?? 0;

  const text = withoutCode
    .replace(/(?:^\|.*\|[ \t]*\r?\n?)+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~#>]/g, "");

  const zhChars = text.match(/[一-鿿]/g)?.length ?? 0;
  const enWords =
    text.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g)?.length ?? 0;

  const readingSeconds =
    (zhChars / ZH_CHARS_PER_MINUTE + enWords / EN_WORDS_PER_MINUTE) *
    60 *
    TYPE_MULTIPLIER[type];
  const extraSeconds =
    images * SECONDS_PER_IMAGE +
    tableBlocks * SECONDS_PER_TABLE +
    codeBlocks * SECONDS_PER_CODE_BLOCK;

  return Math.max(1, Math.round((readingSeconds + extraSeconds) / 60));
}
