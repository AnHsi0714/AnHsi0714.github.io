import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { scrollBehavior } from "../lib/motion";
import type { MarkdownHeading, MarkdownHeadingLevel } from "../lib/markdown";

interface TableOfContentsProps {
  title: string;
  sections: MarkdownHeading[];
  backLink?: { to: string; label: string };
}

// h2 為基準（不縮排），每深一級多縮一階；之後若正文出現 h4 會自動多縮一層，不用再改這裡
const indentByLevel: Record<MarkdownHeadingLevel, string> = {
  2: "toc-level-2",
  3: "toc-level-3",
  4: "toc-level-4",
};

// 與 index.css 的 .toc-drawer 寬度斷點一致：寬螢幕目錄展開時把內容往右推，窄螢幕則蓋在上面
const WIDE_QUERY = "(min-width: 761px)";

// 左上角固定一排方形按鈕：burger（展開目錄，在左）+ 回列表（箭頭，在右），
// 捲到哪裡都能回列表，所以頁面開頭／結尾不再另放回列表連結。
// burger 按鈕 + 左側抽屜目錄，樣式參考 CPBL2outStealDecision 報告的目錄（樣式在 index.css 的 .toc-*）。
// 寬螢幕展開時會在 <html> 加 toc-open，讓 index.css 把 main 往右推而不是蓋住內容；
// 窄螢幕改用遮罩，點遮罩、按 Esc 或點連結都會收起。
// 跳轉靠 index.css 的 [id] scroll-margin-top 避開 sticky NavBar。
export default function TableOfContents({ title, sections, backLink }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hasHeadings = sections.length > 1;

  // has-toc：index.css 靠它在窄螢幕替 burger 在 main 左邊留 gutter，避免蓋到文字
  useEffect(() => {
    if (!hasHeadings && !backLink) return;
    document.documentElement.classList.add("has-toc");
    return () => document.documentElement.classList.remove("has-toc");
  }, [hasHeadings, backLink]);

  useEffect(() => {
    document.documentElement.classList.toggle("toc-open", isOpen);
    return () => document.documentElement.classList.remove("toc-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // 捲動時標出目前所在小節：取最後一個頂端已經捲過 NavBar 下緣的標題
  useEffect(() => {
    if (!hasHeadings) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const navH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;
      let current: string | null = null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= navH + 24) current = section.id;
      }
      // 最後一節常短到捲不到頂端，捲到頁底時直接視為最後一節，不然會一直停在前一節
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hasHeadings, sections]);

  if (!hasHeadings && !backLink) return null;

  return (
    <>
      {/* 按鈕底下的實心底：內文捲到按鈕附近時被蓋住，不會從按鈕旁邊透出來 */}
      <div className="toc-bar" aria-hidden="true" />
      {backLink && (
        <Link
          to={backLink.to}
          state={{ restoreScroll: true }}
          aria-label={backLink.label}
          data-tip={backLink.label}
          className={`toc-btn ${hasHeadings ? "toc-btn-second" : ""}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            className="h-[18px] w-[18px]"
          >
            <path d="M16 10H4M9 5l-5 5 5 5" />
          </svg>
        </Link>
      )}
      {hasHeadings && (
        <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="toc-drawer"
        aria-label={title}
        data-tip={title}
        className="toc-btn"
      >
        <span className="toc-icon" aria-hidden="true" />
      </button>
      <div
        className={`toc-scrim ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <nav
        id="toc-drawer"
        aria-label={title}
        className={`toc-drawer ${isOpen ? "open" : ""}`}
        // inert 讓收起時抽屜裡的連結不會被 Tab focus 到
        inert={!isOpen}
      >
        <h2>{title}</h2>
        <ul>
          {sections.map((section) => (
            <li key={section.id} className={indentByLevel[section.level]}>
              <a
                href={`#${section.id}`}
                aria-current={activeId === section.id ? "true" : undefined}
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
                  target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
                  history.pushState(null, "", `#${section.id}`);
                  // 窄螢幕抽屜是蓋在內容上，跳轉後要收起；寬螢幕內容被推開，保持展開方便連續跳
                  if (!window.matchMedia(WIDE_QUERY).matches) setIsOpen(false);
                }}
              >
                {section.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
        </>
      )}
    </>
  );
}
