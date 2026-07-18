import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useTranslation } from "../../i18n/useTranslation";

interface InviteGateProps {
  initialCode?: string;
  initialNickname?: string;
  // 回傳錯誤訊息字串表示碼不能用（顯示在邀請碼欄位），回傳 null 表示通過
  onSubmit: (code: string, nickname: string) => Promise<string | null>;
}

// 送出時呼叫 check_invite_code RPC 檢查碼的狀態：沒用過的碼進入創作模式、
// 用過的碼載入原作品進入編輯模式（見 supabase/migrations/0002_check_and_edit_creation.sql）
export default function InviteGate({
  initialCode = "",
  initialNickname = "",
  onSubmit,
}: InviteGateProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState(initialNickname);
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState<{ code?: string; nickname?: string }>(
    {},
  );

  const handleSubmit = async () => {
    const trimmedCode = code.trim();
    const trimmedNickname = nickname.trim();
    const nextErrors = {
      code: trimmedCode ? undefined : t.creator.codeRequired,
      nickname: trimmedNickname ? undefined : t.creator.nicknameRequired,
    };
    setErrors(nextErrors);
    if (nextErrors.code || nextErrors.nickname) return;

    setChecking(true);
    try {
      const failure = await onSubmit(trimmedCode, trimmedNickname);
      if (failure) setErrors({ code: failure });
    } catch (err) {
      setErrors({
        code: err instanceof Error ? err.message : t.creator.checkError,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="mx-auto mt-8 max-w-sm space-y-4"
    >
      <Input
        label={t.creator.inviteCode}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t.creator.inviteCodePlaceholder}
        autoComplete="off"
        error={errors.code}
      />
      <Input
        label={t.creator.nickname}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder={t.creator.nicknamePlaceholder}
        maxLength={20}
        autoComplete="off"
        error={errors.nickname}
      />
      <Button type="submit" className="w-full" disabled={checking}>
        {checking ? t.creator.checking : t.creator.start}
      </Button>
    </form>
  );
}
