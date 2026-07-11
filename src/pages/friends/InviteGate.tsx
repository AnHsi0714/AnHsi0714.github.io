import { useState, type FormEvent } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";

interface InviteGateProps {
  initialCode?: string;
  initialNickname?: string;
  onSubmit: (code: string, nickname: string) => void;
}

// 只做「有沒有填」的檢查；邀請碼是否有效要等送出作品時由 RPC 判定
// （invite_codes 完全不開放 select，前端無從預先驗證，見 supabase/migrations/0001_init.sql）
export default function InviteGate({
  initialCode = "",
  initialNickname = "",
  onSubmit,
}: InviteGateProps) {
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState(initialNickname);
  const [errors, setErrors] = useState<{ code?: string; nickname?: string }>(
    {},
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const trimmedNickname = nickname.trim();
    const nextErrors = {
      code: trimmedCode ? undefined : "請輸入邀請碼",
      nickname: trimmedNickname ? undefined : "請輸入暱稱",
    };
    setErrors(nextErrors);
    if (nextErrors.code || nextErrors.nickname) return;
    onSubmit(trimmedCode, trimmedNickname);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-sm space-y-4">
      <Input
        label="邀請碼"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="輸入我私下給你的邀請碼"
        autoComplete="off"
        error={errors.code}
      />
      <Input
        label="暱稱"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="會跟作品一起展示的名字"
        maxLength={20}
        autoComplete="off"
        error={errors.nickname}
      />
      <Button type="submit" className="w-full">
        開始作畫
      </Button>
    </form>
  );
}
