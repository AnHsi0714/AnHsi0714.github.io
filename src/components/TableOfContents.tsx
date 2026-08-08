import { useState } from "react";
import type { MarkdownHeading, MarkdownHeadingLevel } from "../lib/markdown";

interface TableOfContentsProps {
  title: string;
  sections: MarkdownHeading[];
}

// h2 為基準（不縮排），每深一級多縮一階；之後若正文出現 h4 會自動多縮一層，不用再改這裡
const indentByLevel: Record<MarkdownHeadingLevel, string | undefined> = {
  2: undefined,
  3: "pl-3",
  4: "pl-6",
};

// 浮在主內容左側空白區的跳轉目錄，參考 src/pages/dev/ComponentsPreview.tsx 的元件目錄設計，
// 只在版面夠寬（2xl）時顯示，靠 App.tsx 既有的 hash 平滑捲動 + index.css 的 [id] scroll-margin-top 運作
export default function TableOfContents({ title, sections }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (sections.length === 0) return null;

  return (
    <aside
      className="fixed left-6 hidden w-44 2xl:block"
      style={{ top: "calc(var(--nav-h, 0px) + 24px)" }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-semibold"
      >
        {title}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="flex flex-col gap-1 overflow-hidden text-sm text-[var(--color-text-muted)]">
          {sections.map((section) => (
            <li key={section.id} className={indentByLevel[section.level]}>
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  // 同頁錨點原生跳轉在這個版面下不可靠（react-router 的
                  // BrowserRouter 不一定會把純 <a href="#id"> 的 fragment
                  // 導覽視為一次 location 變化，App.tsx 的 hash 捲動 effect
                  // 因此不一定會觸發），改成直接抓 DOM 元素自己捲，同時保留
                  // 修飾鍵點擊（開新分頁等）的原生行為
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }
                  const target = document.getElementById(section.id);
                  if (!target) return;
                  event.preventDefault();
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.pushState(null, "", `#${section.id}`);
                }}
                className="block rounded-md px-2 py-1 hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                {section.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
