// JS 觸發的捲動動畫（scrollIntoView 等）明確指定 behavior: 'smooth' 時會蓋過 CSS 的
// scroll-behavior，index.css 的全域 reduced-motion 保底管不到，要在呼叫端自己判斷。
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
