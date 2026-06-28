import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ExpandableCard from "../../components/ExpandableCard";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Alert from "../../components/Alert";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

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
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-neutral-100 text-sm text-neutral-400">
              圖片預覽
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-semibold">範例專案名稱</p>
              <Badge variant="doing" className="shrink-0">
                進行中
              </Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              圖片 + 標題 + 狀態 Badge + 說明文字，對應 Projects／Friends
              頁面的實際排版。
            </p>
          </Card>
          <ExpandableCard
            image={
              <div className="flex h-80 w-full items-center justify-center rounded-md-lg bg-neutral-100 text-sm text-neutral-400">
                圖片預覽
              </div>
            }
            expandedContent={
              <div className="max-h-40 overflow-y-auto px-6 pb-6 pt-3">
                <p className="font-semibold">完整內容</p>
                <p className="mt-1 text-sm text-neutral-600">
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
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              這段文字被截斷了，點擊卡片可以看到完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容、完整內容。
            </p>
          </ExpandableCard>
          <Card className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-2xl font-semibold text-neutral-300 sm:h-24 sm:w-24">
              文
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">範例文章標題</p>
              <p className="text-sm text-neutral-500">2026-06-27</p>
              <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
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
        <h2 className="text-xl font-bold">EmptyState</h2>
        <div className="mt-3">
          <EmptyState title="尚無內容" description="這個區塊還沒有任何資料" />
        </div>
      </section>
    </div>
  );
}
