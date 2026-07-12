// 共用「體素四足怪獸」的身體形狀資料——純資料，不含 React／three 匯入，
// 之後不管是 demo 塗色還是正式的塗色編輯器，都會 import 同一份形狀，
// 所以座標系統／分組方式要禁得起延用。
//
// 座標系統：以軀幹底部中心為原點的整數格座標，+x 右、+y 上、+z 前。
// 四隻腳／尾巴／角各自的方塊清單是相對自己的「樞軸」（肩/髖/尾根）算的局部座標，
// 樞軸就是動畫要旋轉的支點，跟方塊怎麼排列強綁定，所以放在一起匯出。
//
// 以下座標是用 /dev/creature-builder 那個互動堆積木工具手雕出來的（不是程式生成
// 的規則方塊堆），所以看起來不是工整的長方體——這是刻意的，雕的時候特別加了角、
// 讓頭變成正方形臉、身體曲度變多。之後想調整形狀，一樣去那個工具雕、匯出貼回這裡。

export interface VoxelCoord {
  x: number;
  y: number;
  z: number;
}

// 世界座標下每個方塊的邊長。
export const CUBE_SIZE = 0.13;

// 軀幹底部所在的 y（四隻腳／樞軸都掛在這一層的方塊上）。
const TORSO_BOTTOM_Y = 2;

export const torsoCubes: VoxelCoord[] = [
  { x: -3, y: 2, z: -1 },
  { x: -3, y: 2, z: 0 },
  { x: -3, y: 2, z: 1 },
  { x: -3, y: 3, z: -3 },
  { x: -3, y: 3, z: -2 },
  { x: -3, y: 3, z: -1 },
  { x: -3, y: 3, z: 0 },
  { x: -3, y: 3, z: 1 },
  { x: -3, y: 3, z: 2 },
  { x: -3, y: 4, z: -2 },
  { x: -3, y: 4, z: -1 },
  { x: -3, y: 4, z: 0 },
  { x: -3, y: 4, z: 1 },
  { x: -2, y: 2, z: -3 },
  { x: -2, y: 2, z: -2 },
  { x: -2, y: 2, z: -1 },
  { x: -2, y: 2, z: 0 },
  { x: -2, y: 2, z: 1 },
  { x: -2, y: 2, z: 2 },
  { x: -2, y: 3, z: -3 },
  { x: -2, y: 3, z: -2 },
  { x: -2, y: 3, z: -1 },
  { x: -2, y: 3, z: 0 },
  { x: -2, y: 3, z: 1 },
  { x: -2, y: 3, z: 2 },
  { x: -2, y: 3, z: 3 },
  { x: -2, y: 4, z: -3 },
  { x: -2, y: 4, z: -2 },
  { x: -2, y: 4, z: -1 },
  { x: -2, y: 4, z: 0 },
  { x: -2, y: 4, z: 1 },
  { x: -2, y: 4, z: 2 },
  { x: -2, y: 4, z: 3 },
  { x: -2, y: 5, z: -2 },
  { x: -2, y: 5, z: 0 },
  { x: -2, y: 5, z: 2 },
  { x: -1, y: 2, z: -3 },
  { x: -1, y: 2, z: -2 },
  { x: -1, y: 2, z: -1 },
  { x: -1, y: 2, z: 0 },
  { x: -1, y: 2, z: 1 },
  { x: -1, y: 2, z: 2 },
  { x: -1, y: 2, z: 3 },
  { x: -1, y: 3, z: -3 },
  { x: -1, y: 3, z: -2 },
  { x: -1, y: 3, z: -1 },
  { x: -1, y: 3, z: 0 },
  { x: -1, y: 3, z: 1 },
  { x: -1, y: 3, z: 2 },
  { x: -1, y: 3, z: 3 },
  { x: -1, y: 4, z: -3 },
  { x: -1, y: 4, z: -2 },
  { x: -1, y: 4, z: -1 },
  { x: -1, y: 4, z: 0 },
  { x: -1, y: 4, z: 1 },
  { x: -1, y: 4, z: 2 },
  { x: -1, y: 4, z: 3 },
  { x: -1, y: 5, z: -3 },
  { x: -1, y: 5, z: -2 },
  { x: -1, y: 5, z: -1 },
  { x: -1, y: 5, z: 0 },
  { x: -1, y: 5, z: 1 },
  { x: -1, y: 5, z: 2 },
  { x: -1, y: 5, z: 3 },
  { x: -1, y: 6, z: -1 },
  { x: -1, y: 6, z: 0 },
  { x: -1, y: 6, z: 1 },
  { x: 0, y: 2, z: -3 },
  { x: 0, y: 2, z: -2 },
  { x: 0, y: 2, z: -1 },
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 2, z: 1 },
  { x: 0, y: 2, z: 2 },
  { x: 0, y: 2, z: 3 },
  { x: 0, y: 3, z: -3 },
  { x: 0, y: 3, z: -2 },
  { x: 0, y: 3, z: -1 },
  { x: 0, y: 3, z: 0 },
  { x: 0, y: 3, z: 1 },
  { x: 0, y: 3, z: 2 },
  { x: 0, y: 3, z: 3 },
  { x: 0, y: 4, z: -3 },
  { x: 0, y: 4, z: -2 },
  { x: 0, y: 4, z: -1 },
  { x: 0, y: 4, z: 0 },
  { x: 0, y: 4, z: 1 },
  { x: 0, y: 4, z: 2 },
  { x: 0, y: 4, z: 3 },
  { x: 0, y: 5, z: -2 },
  { x: 0, y: 5, z: -1 },
  { x: 0, y: 5, z: 0 },
  { x: 0, y: 5, z: 1 },
  { x: 0, y: 5, z: 2 },
  { x: 0, y: 6, z: -2 },
  { x: 0, y: 6, z: -1 },
  { x: 0, y: 6, z: 0 },
  { x: 0, y: 6, z: 1 },
  { x: 0, y: 6, z: 2 },
  { x: 1, y: 2, z: -3 },
  { x: 1, y: 2, z: -2 },
  { x: 1, y: 2, z: -1 },
  { x: 1, y: 2, z: 0 },
  { x: 1, y: 2, z: 1 },
  { x: 1, y: 2, z: 2 },
  { x: 1, y: 2, z: 3 },
  { x: 1, y: 3, z: -3 },
  { x: 1, y: 3, z: -2 },
  { x: 1, y: 3, z: -1 },
  { x: 1, y: 3, z: 0 },
  { x: 1, y: 3, z: 1 },
  { x: 1, y: 3, z: 2 },
  { x: 1, y: 3, z: 3 },
  { x: 1, y: 4, z: -3 },
  { x: 1, y: 4, z: -2 },
  { x: 1, y: 4, z: -1 },
  { x: 1, y: 4, z: 0 },
  { x: 1, y: 4, z: 1 },
  { x: 1, y: 4, z: 2 },
  { x: 1, y: 4, z: 3 },
  { x: 1, y: 5, z: -3 },
  { x: 1, y: 5, z: -2 },
  { x: 1, y: 5, z: -1 },
  { x: 1, y: 5, z: 0 },
  { x: 1, y: 5, z: 1 },
  { x: 1, y: 5, z: 2 },
  { x: 1, y: 5, z: 3 },
  { x: 1, y: 6, z: -1 },
  { x: 1, y: 6, z: 0 },
  { x: 1, y: 6, z: 1 },
  { x: 2, y: 2, z: -3 },
  { x: 2, y: 2, z: -2 },
  { x: 2, y: 2, z: -1 },
  { x: 2, y: 2, z: 0 },
  { x: 2, y: 2, z: 1 },
  { x: 2, y: 2, z: 2 },
  { x: 2, y: 3, z: -3 },
  { x: 2, y: 3, z: -2 },
  { x: 2, y: 3, z: -1 },
  { x: 2, y: 3, z: 0 },
  { x: 2, y: 3, z: 1 },
  { x: 2, y: 3, z: 2 },
  { x: 2, y: 3, z: 3 },
  { x: 2, y: 4, z: -3 },
  { x: 2, y: 4, z: -2 },
  { x: 2, y: 4, z: -1 },
  { x: 2, y: 4, z: 0 },
  { x: 2, y: 4, z: 1 },
  { x: 2, y: 4, z: 2 },
  { x: 2, y: 4, z: 3 },
  { x: 2, y: 5, z: -2 },
  { x: 2, y: 5, z: 0 },
  { x: 2, y: 5, z: 2 },
  { x: 3, y: 2, z: -1 },
  { x: 3, y: 2, z: 0 },
  { x: 3, y: 2, z: 1 },
  { x: 3, y: 3, z: -3 },
  { x: 3, y: 3, z: -2 },
  { x: 3, y: 3, z: -1 },
  { x: 3, y: 3, z: 0 },
  { x: 3, y: 3, z: 1 },
  { x: 3, y: 3, z: 2 },
  { x: 3, y: 4, z: -2 },
  { x: 3, y: 4, z: -1 },
  { x: 3, y: 4, z: 0 },
  { x: 3, y: 4, z: 1 },
];

export const headCubes: VoxelCoord[] = [
  { x: -2, y: 4, z: 6 },
  { x: -1, y: 3, z: 4 },
  { x: -1, y: 3, z: 5 },
  { x: -1, y: 3, z: 6 },
  { x: -1, y: 4, z: 4 },
  { x: -1, y: 4, z: 5 },
  { x: -1, y: 4, z: 6 },
  { x: -1, y: 5, z: 4 },
  { x: -1, y: 5, z: 5 },
  { x: -1, y: 5, z: 6 },
  { x: 0, y: 2, z: 6 },
  { x: 0, y: 3, z: 4 },
  { x: 0, y: 3, z: 5 },
  { x: 0, y: 3, z: 6 },
  { x: 0, y: 4, z: 4 },
  { x: 0, y: 4, z: 5 },
  { x: 0, y: 4, z: 6 },
  { x: 0, y: 5, z: 4 },
  { x: 0, y: 5, z: 5 },
  { x: 0, y: 5, z: 6 },
  { x: 1, y: 3, z: 4 },
  { x: 1, y: 3, z: 5 },
  { x: 1, y: 3, z: 6 },
  { x: 1, y: 4, z: 4 },
  { x: 1, y: 4, z: 5 },
  { x: 1, y: 4, z: 6 },
  { x: 1, y: 5, z: 4 },
  { x: 1, y: 5, z: 5 },
  { x: 1, y: 5, z: 6 },
  { x: 2, y: 4, z: 6 },
];

export const hornCubes: VoxelCoord[] = [
  { x: -2, y: 6, z: 5 },
  { x: -2, y: 7, z: 5 },
  { x: -1, y: 6, z: 4 },
  { x: -1, y: 6, z: 5 },
  { x: 1, y: 6, z: 4 },
  { x: 1, y: 6, z: 5 },
  { x: 2, y: 6, z: 5 },
  { x: 2, y: 7, z: 5 },
];

export interface PivotPart {
  // 相對軀幹原點的樞軸位置（動畫旋轉支點：肩、髖、尾根），本身落在軀幹既有的方塊上。
  pivot: VoxelCoord;
  // 相對樞軸的局部方塊座標。
  cubes: VoxelCoord[];
}

// 尾巴：樞軸落在軀幹最後面中央那顆方塊上，可以做搖尾動畫。
export const tail: PivotPart = {
  pivot: { x: 0, y: TORSO_BOTTOM_Y + 1, z: -3 },
  cubes: [
    { x: 0, y: 0, z: -3 },
    { x: 0, y: 0, z: -2 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 1, z: -2 },
    { x: 0, y: 1, z: -1 },
  ],
};

// 單隻腳的局部方塊，四隻腳共用同一份局部形狀。
const legCubes: VoxelCoord[] = [
  { x: 0, y: -2, z: 0 },
  { x: 0, y: -2, z: 1 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -2, z: 0 },
  { x: 1, y: -2, z: 1 },
  { x: 1, y: -1, z: 0 },
];

export type LegName = "frontLeft" | "frontRight" | "backLeft" | "backRight";

// 四隻腳的樞軸落在軀幹底部、前後各內縮一格的位置，都直接落在軀幹既有的方塊座標上。
export const legs: Record<LegName, PivotPart> = {
  frontLeft: { pivot: { x: -2, y: TORSO_BOTTOM_Y, z: 2 }, cubes: legCubes },
  frontRight: { pivot: { x: 1, y: TORSO_BOTTOM_Y, z: 2 }, cubes: legCubes },
  backLeft: { pivot: { x: -2, y: TORSO_BOTTOM_Y, z: -3 }, cubes: legCubes },
  backRight: { pivot: { x: 1, y: TORSO_BOTTOM_Y, z: -3 }, cubes: legCubes },
};

// 對角步態的兩組（trot）：同一組同相位擺動、兩組互為反相位。
export const trotPairs: [LegName, LegName][] = [
  ["frontLeft", "backRight"],
  ["frontRight", "backLeft"],
];

// 讓整隻怪獸最低的那顆腳方塊底面剛好貼著世界座標 y=0（依實際腳形狀動態算，
// 不寫死高度——雕出來的腳不是規則長方體，最低點不一定是固定格數）。
const lowestLegLocalY = Math.min(...legCubes.map((c) => c.y));
const lowestLegWorldY = TORSO_BOTTOM_Y + lowestLegLocalY;
export const bodyGroundOffset = (0.5 - lowestLegWorldY) * CUBE_SIZE;

// Phase 1 示意色：純粹讓形狀看得清楚，不接任何朋友創作資料。
export const creatureColors = {
  torso: "#8a7f6b",
  head: "#a68b5b",
  horn: "#e8e1d3",
  tail: "#5c5346",
  leg: "#5c5346",
};
