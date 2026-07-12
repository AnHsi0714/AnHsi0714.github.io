// 對應 docs/ARCHITECTURE.md §7 的 data jsonb 結構與 supabase/migrations/0001_init.sql 的 friend_creations

import type { VoxelRegion } from "../lib/creatureBody";

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

// 3D 版：怪獸形狀固定（見 creatureBody.ts），朋友只能改顏色，一樣是稀疏陣列，
// 只存塗過色的格子；region 標明是哪個部位（軀幹/頭/角/尾巴/四腳分開，四腳各自
// 獨立上色不互相同步）。
export interface VoxelPixel {
  region: VoxelRegion;
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface VoxelCreatureData {
  colors: VoxelPixel[];
}

export type CreationKind = "2d" | "3d";

// 判別聯集：依 kind 收斂 data 的型別，避免 2D/3D 兩種資料格式互相搞混。
export interface FriendCreationRow2D {
  id: number;
  nickname: string;
  kind: "2d";
  data: PixelData;
  intro: string | null; // 選填敘述，創作牆上點擊置中作品時顯示
  created_at: string;
}

export interface FriendCreationRow3D {
  id: number;
  nickname: string;
  kind: "3d";
  data: VoxelCreatureData;
  intro: string | null;
  created_at: string;
}

export type FriendCreationRow = FriendCreationRow2D | FriendCreationRow3D;
