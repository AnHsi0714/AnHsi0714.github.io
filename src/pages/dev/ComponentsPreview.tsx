import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ExpandableCard from "../../components/ExpandableCard";
import Badge from "../../components/Badge";
import Chip from "../../components/Chip";
import Input from "../../components/Input";
import Alert from "../../components/Alert";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import ProgressBar from "../../components/ProgressBar";
import TextLink from "../../components/TextLink";
import Tooltip from "../../components/Tooltip";
import knowledgeData from "../../../content/knowledge.json";
import type { KnowledgeNode } from "../../types/content";

const knowledgeMap = knowledgeData as Record<string, KnowledgeNode>;

const SECTIONS = [
  { id: "button", label: "Button" },
  { id: "card", label: "Card" },
  { id: "badge", label: "Badge" },
  { id: "chip", label: "Chip" },
  { id: "input", label: "Input" },
  { id: "alert", label: "Alert" },
  { id: "loading", label: "Loading" },
  { id: "progress-bar", label: "ProgressBar" },
  { id: "text-link", label: "TextLink" },
  { id: "modal", label: "Modal" },
  { id: "tooltip", label: "Tooltip" },
  { id: "empty-state", label: "EmptyState" },
];

function TableOfContents() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      // fixed 定位讓目錄浮在版面左側的空白區域，不佔用 flex 空間、不會擠壓主內容寬度；
      // 只在版面夠寬（2xl，主內容 max-w-5xl 之外還留得出空間）時才顯示，避免窄一點的桌機螢幕蓋到內容。
      className="fixed left-6 hidden w-44 2xl:block"
      style={{ top: "calc(var(--nav-h, 0px) + 24px)" }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-semibold"
      >
        元件目錄
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
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-md px-2 py-1 hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function LoadingProgressDemo() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (complete) {
      const resetTimer = setTimeout(() => {
        setComplete(false);
        setProgress(0);
      }, 1000);
      return () => clearTimeout(resetTimer);
    }

    const tickTimer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          setComplete(true);
          return current;
        }
        return current + 4;
      });
    }, 80);
    return () => clearInterval(tickTimer);
  }, [complete]);

  return (
    <Loading
      size="md"
      label="載入中…"
      progress={progress}
      complete={complete}
    />
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>開啟 Modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="範例彈窗"
        backdropClassName="bg-black/60 p-6"
        panelClassName="w-full max-w-sm rounded-lg bg-[var(--color-bg)] p-6 shadow-lg"
      >
        <p className="font-semibold">範例彈窗標題</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          點背景或按 Esc 即可關閉。ExpandableCard 跟 Friends
          的作品詳情遮罩都是共用這個元件做的，各自用 backdropClassName／
          panelClassName 套自己的樣式。
        </p>
        <Button className="mt-4" onClick={() => setOpen(false)}>
          關閉
        </Button>
      </Modal>
    </>
  );
}

export default function ComponentsPreview() {
  return (
    <div className="flex flex-col gap-10">
      <TableOfContents />
      <section id="button" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Button</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section id="card" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Card</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>一般卡片內容</Card>
          <Card hoverable>滑過會浮起的卡片（無圖，可點擊至其他頁面用）</Card>
          <Card hoverable>
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
              圖片預覽
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-semibold">範例專案名稱</p>
              <Badge variant="doing" className="shrink-0">
                進行中
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              圖片 + 標題 + 狀態 Badge + 說明文字，對應 Projects／Friends
              頁面的實際排版。
            </p>
          </Card>
          <ExpandableCard
            placard
            image={
              <div className="flex aspect-video w-full items-center justify-center rounded-md bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
                圖片預覽
              </div>
            }
            expandedContent={
              <div className="max-h-60 overflow-y-auto px-6 pb-6 pt-4">
                <p className="text-lg font-semibold">Perlin 山水</p>
                <p className="mt-0.5 text-xs tracking-widest text-[var(--color-text-muted)]">
                  2026 · p5.js · 互動生成
                </p>
                <hr className="my-3 border-[var(--color-border)]" />
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  以流場噪聲繪製的動態山水，每次載入都是獨一無二的構圖。滑鼠移動可以擾動流場的方向，
                  按住拖曳能在畫面上留下墨色的軌跡；山勢的起伏由多層 Perlin
                  noise 疊加而成，前景與遠景以不同的頻率呼吸。
                  這層展開面板做成「美術館說明牌」：無圓角，淺色模式是啞光紙色、
                  深色模式轉成展牆名牌的暗色配色，跟生成視覺的作品介紹同一套。
                  按遮罩外或 Esc 即可關閉。
                </p>
              </div>
            }
          >
            <p className="mt-3 font-semibold">Perlin 山水</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              這段介紹被截斷了，點擊卡片會在暗色遮罩上展開完整的作品說明牌，
              對應之後生成視覺的作品介紹用法。
            </p>
          </ExpandableCard>
          <Card className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] text-2xl font-semibold text-[var(--color-border)] sm:h-24 sm:w-24">
              文
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">範例文章標題</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                2026-06-27
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                橫向排列、圖片在左側的卡片，對應 Articles 頁面的列表項目排版。
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section id="badge" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Badge</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge variant="neutral">neutral</Badge>
          <Badge variant="todo">todo</Badge>
          <Badge variant="doing">doing</Badge>
          <Badge variant="done">done</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="danger">danger</Badge>
        </div>
      </section>

      <section id="chip" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Chip</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          內容標籤元件，微透明背景。適用於技能、分類、書卷等標註。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip>default</Chip>
          <Chip variant="success">success</Chip>
          <Chip variant="info">info</Chip>
          <Chip variant="warn">warn</Chip>
          <Chip variant="danger">danger</Chip>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Chip size="sm">default sm</Chip>
          <Chip variant="success" size="sm">
            success sm
          </Chip>
          <Chip variant="info" size="sm">
            info sm
          </Chip>
          <Chip variant="warn" size="sm">
            書卷
          </Chip>
          <Chip variant="danger" size="sm">
            danger sm
          </Chip>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Chip tone="filled">default filled</Chip>
          <Chip tone="filled" variant="success">
            success filled
          </Chip>
          <Chip tone="filled" variant="info">
            info filled
          </Chip>
          <Chip tone="filled" variant="warn">
            warn filled
          </Chip>
          <Chip tone="filled" variant="danger">
            danger filled
          </Chip>
        </div>
      </section>

      <section id="input" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Input</h2>
        <div className="mt-3 flex max-w-sm flex-col gap-4">
          <Input label="暱稱" placeholder="輸入暱稱" />
          <Input
            label="邀請碼"
            placeholder="輸入邀請碼"
            error="邀請碼無效或已使用"
          />
        </div>
      </section>

      <section id="alert" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Alert</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Alert variant="info">這是一則提示訊息</Alert>
          <Alert variant="success">操作成功</Alert>
          <Alert variant="error">邀請碼無效或已使用</Alert>
        </div>
      </section>

      <section id="loading" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Loading</h2>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <Loading size="sm" label="載入中…" />
          <Loading size="md" label="載入中…" />
          <Loading size="lg" label="載入中…" />
          <LoadingProgressDemo />
        </div>
      </section>

      <section id="progress-bar" className="scroll-mt-20">
        <h2 className="text-xl font-bold">ProgressBar</h2>
        <div className="mt-3 flex max-w-sm flex-col gap-3">
          <ProgressBar progress={30} />
          <ProgressBar current={3} target={10} unit="本" />
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          分段色塊（segmented）
        </p>
        <div className="mt-2 flex max-w-sm flex-col gap-3">
          <ProgressBar
            progress={37}
            variant="segmented"
            current={37}
            target={100}
            unit="%"
          />
          <ProgressBar
            progress={70}
            variant="segmented"
            current={70}
            target={100}
            unit="%"
          />
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          腳印（footprint）
        </p>
        <div className="mt-2 flex max-w-sm flex-col gap-3">
          <ProgressBar progress={30} variant="footprint" />
          <ProgressBar progress={70} variant="footprint" />
        </div>
      </section>

      <section id="text-link" className="scroll-mt-20">
        <h2 className="text-xl font-bold">TextLink</h2>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <TextLink to="/playground">站內連結（react-router Link）</TextLink>
          <TextLink href="https://github.com">外部連結（新分頁開啟）</TextLink>
          <TextLink href="mailto:test@example.com">
            mailto 連結（不開新分頁）
          </TextLink>
        </div>
      </section>

      <section id="modal" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Modal</h2>
        <div className="mt-3">
          <ModalDemo />
        </div>
      </section>

      <section id="tooltip" className="scroll-mt-20">
        <h2 className="text-xl font-bold">Tooltip</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Hover／focus 觸發的輕量提示泡泡，跟 Term
          共用同一套「量測後決定開上方或下方」定位邏輯，但外觀更輕量、沒有點擊互動，適合替內文中的專有名詞加上簡短補充。下方套用跟
          MarkdownContent 一樣的 prose 樣式，模擬實際嵌在文章段落中的樣子。
        </p>
        <div className="prose prose-neutral mt-3 max-w-none">
          <p>
            CodePulse 把使用者程式碼跟標準演算法比對
            <Tooltip content={knowledgeMap["cosine-similarity"].definition}>
              <span className="font-semibold">
                {" "}
                {knowledgeMap["cosine-similarity"].term}{" "}
              </span>
            </Tooltip>
            ，相似度高於門檻才觸發對應的動畫效果。
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          <Tooltip content={knowledgeMap["elo-rating"].definition}>
            {knowledgeMap["elo-rating"].term}
          </Tooltip>
          <Tooltip content={knowledgeMap["rls"].definition}>
            {knowledgeMap["rls"].term}
          </Tooltip>
        </div>
      </section>

      <section id="empty-state" className="scroll-mt-20">
        <h2 className="text-xl font-bold">EmptyState</h2>
        <div className="mt-3">
          <EmptyState title="尚無內容" description="這個區塊還沒有任何資料" />
        </div>
      </section>
    </div>
  );
}
