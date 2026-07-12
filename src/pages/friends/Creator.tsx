import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import PixelCanvas from "../../components/PixelCanvas";
import VoxelPaintedCreature from "../../components/VoxelPaintedCreature";
import {
  checkInviteCode,
  redeemInviteAndCreate,
  updateCreationWithCode,
} from "../../lib/friends";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import type {
  CreationKind,
  PixelData,
  VoxelCreatureData,
} from "../../types/friends";
import InviteGate from "./InviteGate";
import Creator2DEditor from "./Creator2DEditor";
import Creator3DEditor from "./Creator3DEditor";

interface SubmitVars {
  code: string;
  nickname: string;
  data: PixelData | VoxelCreatureData;
  intro?: string;
}

// gate（檢查邀請碼）→ 選創作類型（僅新作品，2D/3D）→ 對應編輯器；identity 存下來
// 後可回頭改，不會弄丟畫到一半的東西。已用過的碼在 gate 就載入原作品（含 kind，
// 不能在編輯模式換類型）進入編輯模式。
export default function Creator() {
  const [identity, setIdentity] = useState<{
    code: string;
    nickname: string;
  } | null>(null);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [kind, setKind] = useState<CreationKind | null>(null);
  const [initialData, setInitialData] = useState<
    PixelData | VoxelCreatureData | null
  >(null);
  const [initialIntro, setInitialIntro] = useState("");

  const mutation = useMutation({
    mutationFn: (vars: SubmitVars) =>
      mode === "edit"
        ? updateCreationWithCode(vars)
        : redeemInviteAndCreate({ ...vars, kind: kind! }),
  });

  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-bold">畫一個作品</h1>
        <Alert variant="info" className="mt-6">
          後端尚未設定（缺 Supabase 環境變數），暫時無法提交作品。
        </Alert>
      </section>
    );
  }

  if (mutation.isSuccess) {
    const result = mutation.data;
    return (
      <section className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold">
          {mode === "edit" ? "作品已更新！" : "作品已送出！"}
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          謝謝你，{result.nickname}，
          {mode === "edit"
            ? "創作牆上的作品已經換成新的這張了。"
            : "你的作品已經掛上創作牆了。"}
        </p>
        {result.kind === "2d" ? (
          <PixelCanvas
            data={result.data}
            className="mt-6 h-48 w-48 rounded-md border border-[var(--color-border)]"
          />
        ) : (
          <VoxelPaintedCreature
            data={result.data}
            className="mt-6 h-48 w-48 rounded-md border border-[var(--color-border)]"
          />
        )}
        {result.intro && (
          <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
            「{result.intro}」
          </p>
        )}
        <Link to="/friends" className="mt-6">
          <Button>去創作牆看看</Button>
        </Link>
      </section>
    );
  }

  if (!identity || editingIdentity) {
    return (
      <section>
        <h1 className="text-2xl font-bold">畫一個作品</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          輸入邀請碼和暱稱就能開始創作；已經用過的邀請碼可以重新編輯之前的作品。
        </p>
        <InviteGate
          initialCode={identity?.code}
          initialNickname={identity?.nickname}
          onSubmit={async (code, nickname) => {
            const result = await checkInviteCode(code);
            if (result.status === "invalid") return "邀請碼無效或已過期";
            setIdentity({ code, nickname });
            setEditingIdentity(false);
            if (result.status === "used") {
              setMode("edit");
              // 只在還沒選過創作類型時載入原作品，避免中途改邀請碼把畫到一半的東西蓋掉
              if (kind === null) {
                setKind(result.creation.kind);
                setInitialIntro(result.creation.intro ?? "");
                setInitialData(result.creation.data);
              }
            } else {
              setMode("create");
            }
            return null;
          }}
        />
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">畫一個作品</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        以「{identity.nickname}」的名義創作。
        <button
          type="button"
          onClick={() => setEditingIdentity(true)}
          className="ml-2 underline hover:text-[var(--color-text)]"
        >
          修改邀請碼／暱稱
        </button>
      </p>

      {mode === "edit" && (
        <Alert variant="info" className="mt-4">
          這個邀請碼已經用過，現在是編輯模式——送出後會覆蓋你原本的作品。
        </Alert>
      )}

      {kind === null ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p>選擇創作類型（開始之後就不能換囉）</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" onClick={() => setKind("2d")}>
              2D 像素風
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setKind("3d")}>
              3D 怪獸塗色
            </Button>
          </div>
        </div>
      ) : kind === "2d" ? (
        <Creator2DEditor
          identity={identity}
          mode={mode}
          initialData={initialData as PixelData | null}
          initialIntro={initialIntro}
          onSubmit={(vars) => mutation.mutate(vars)}
          submitting={mutation.isPending}
          submitError={mutation.isError ? mutation.error.message : null}
        />
      ) : (
        <Creator3DEditor
          identity={identity}
          mode={mode}
          initialData={initialData as VoxelCreatureData | null}
          initialIntro={initialIntro}
          onSubmit={(vars) => mutation.mutate(vars)}
          submitting={mutation.isPending}
          submitError={mutation.isError ? mutation.error.message : null}
        />
      )}
    </section>
  );
}
