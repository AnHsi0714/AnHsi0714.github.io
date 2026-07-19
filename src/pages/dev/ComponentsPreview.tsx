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
      <section>
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

      <section>
        <h2 className="text-xl font-bold">Card</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>一般卡片內容</Card>
          <Card hoverable>滑過會浮起的卡片（無圖，可點擊項目用）</Card>
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
            image={
              <div className="flex h-80 w-full items-center justify-center rounded-md-lg bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
                圖片預覽
              </div>
            }
            expandedContent={
              <div className="max-h-40 overflow-y-auto px-6 pb-6 pt-3">
                <p className="font-semibold">完整內容</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  點擊卡片時，會在全螢幕置中顯示這層遮罩與完整內容，圖片會跟卡片一樣顯示在最上方、
                  文字接在下面。按遮罩外或 Esc
                  即可關閉。AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                  AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                  AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                </p>
              </div>
            }
          >
            <p className="mt-3 font-semibold">點擊顯示完整內容</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              這段文字被截斷了，點擊卡片可以看到完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容。
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

      <section>
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

      <section>
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

      <section>
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

      <section>
        <h2 className="text-xl font-bold">Alert</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Alert variant="info">這是一則提示訊息</Alert>
          <Alert variant="success">操作成功</Alert>
          <Alert variant="error">邀請碼無效或已使用</Alert>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Loading</h2>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <Loading size="sm" label="載入中…" />
          <Loading size="md" label="載入中…" />
          <Loading size="lg" label="載入中…" />
          <LoadingProgressDemo />
        </div>
      </section>

      <section>
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

      <section>
        <h2 className="text-xl font-bold">TextLink</h2>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <TextLink to="/playground">站內連結（react-router Link）</TextLink>
          <TextLink href="https://github.com">外部連結（新分頁開啟）</TextLink>
          <TextLink href="mailto:test@example.com">
            mailto 連結（不開新分頁）
          </TextLink>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Modal</h2>
        <div className="mt-3">
          <ModalDemo />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">EmptyState</h2>
        <div className="mt-3">
          <EmptyState title="尚無內容" description="這個區塊還沒有任何資料" />
        </div>
      </section>
    </div>
  );
}
