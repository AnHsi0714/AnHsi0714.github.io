import { supabase } from "./supabaseClient";
import type { FriendCreationRow, PixelData } from "../types/friends";

const NOT_CONFIGURED_MESSAGE =
  "Supabase 尚未設定（缺 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）";

// RLS 只放行 is_visible = true 的列，前端不用再過濾
export async function fetchFriendCreations(): Promise<FriendCreationRow[]> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase
    .from("friend_creations")
    .select("id, nickname, kind, data, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FriendCreationRow[];
}

// 朋友創作唯一的寫入口：邀請碼兌換 + 建立創作（見 supabase/migrations/0001_init.sql）
export async function redeemInviteAndCreate(params: {
  code: string;
  nickname: string;
  data: PixelData;
}): Promise<FriendCreationRow> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);

  const { data, error } = await supabase.rpc("redeem_invite_and_create", {
    p_code: params.code,
    p_nickname: params.nickname,
    p_kind: "2d",
    p_data: params.data,
  });

  if (error) throw error;
  return data as FriendCreationRow;
}
