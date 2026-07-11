import { supabase } from "./supabaseClient";
import type { FriendCreationRow, PixelData } from "../types/friends";

const NOT_CONFIGURED_MESSAGE =
  "Supabase 尚未設定（缺 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）";

// RLS 只放行 is_visible = true 的列，前端不用再過濾
export async function fetchFriendCreations(): Promise<FriendCreationRow[]> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase
    .from("friend_creations")
    .select("id, nickname, kind, data, intro, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FriendCreationRow[];
}

export type InviteCheckResult =
  | { status: "invalid" }
  | { status: "unused" }
  | { status: "used"; creation: FriendCreationRow };

// 作畫前先確認邀請碼狀態；已兌換的碼會帶回原作品供編輯模式載入
// （見 supabase/migrations/0002_check_and_edit_creation.sql）
export async function checkInviteCode(code: string): Promise<InviteCheckResult> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase.rpc("check_invite_code", {
    p_code: code,
  });

  if (error) throw error;
  return data as InviteCheckResult;
}

// 朋友創作唯一的寫入口：邀請碼兌換 + 建立創作（見 supabase/migrations/0001_init.sql）
export async function redeemInviteAndCreate(params: {
  code: string;
  nickname: string;
  data: PixelData;
  intro?: string;
}): Promise<FriendCreationRow> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase.rpc("redeem_invite_and_create", {
    p_code: params.code,
    p_nickname: params.nickname,
    p_kind: "2d",
    p_data: params.data,
    p_intro: params.intro ?? null,
  });

  if (error) throw error;
  return data as FriendCreationRow;
}

// 二次編輯：已兌換的邀請碼是該作品的編輯憑證，送出即覆蓋暱稱＋圖
export async function updateCreationWithCode(params: {
  code: string;
  nickname: string;
  data: PixelData;
  intro?: string;
}): Promise<FriendCreationRow> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase.rpc("update_creation_with_code", {
    p_code: params.code,
    p_nickname: params.nickname,
    p_data: params.data,
    p_intro: params.intro ?? null,
  });

  if (error) throw error;
  return data as FriendCreationRow;
}
