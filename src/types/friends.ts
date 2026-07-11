// 對應 docs/ARCHITECTURE.md §7 的 data jsonb 結構與 supabase/migrations/0001_init.sql 的 friend_creations

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

// 稀疏陣列：只存有上色的格子
export interface PixelData {
  grid: number;
  pixels: Pixel[];
}

export type CreationKind = "2d" | "3d";

export interface FriendCreationRow {
  id: number;
  nickname: string;
  kind: CreationKind;
  data: PixelData;
  created_at: string;
}
