import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
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
    <Loading size="md" label="載入中…" progress={progress} complete={complete} />
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
          <Card hoverable>滑過會浮起的卡片（可點擊項目用）</Card>
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
