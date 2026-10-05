import type p5 from "p5";

// 原稿「莫爾碟影」是 global mode 且無 draw()，只在 setup() 畫一次靜態構圖；
// 改寫成 instance mode，size 從外部傳入。原稿所有像素值（字級 40、留白 50、
// 格距 30、抖動 ±5）都是針對 900x900 畫布寫死的，統一乘上 k = size / 900
// 等比例縮放，讓網格密度不管畫布多大都跟原稿一致。
//
// 原稿的底色是「先鋪 #4e5a56，再切到 DIFFERENCE 後 background(random(255))」，
// 隨機灰階是跟 #4e5a56 做差值後的結果。加上點擊重製時，每次都要先用 BLEND
// 重鋪 #4e5a56，不然差值會疊在上一次的畫面上，越點越偏離原稿的色調。
const REFERENCE_SIZE = 900;
const BASE_COLOR = "#4e5a56";
const TEXT_SIZE = 40;
const GAP = 50;
const STEP = 30;
const JITTER = 5;

export function createMoireDiscShadowsSketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;

    const drawAll = () => {
      p.blendMode(p.BLEND);
      p.background(BASE_COLOR);
      p.blendMode(p.DIFFERENCE);
      p.background(p.random(255));

      const step = STEP * k;
      const n = Math.floor((size - GAP * k * 2) / step) + 1; // 每行/列幾個
      const start = (size - (n - 1) * step) / 2; // 讓左右、上下留白相等

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const x = start + col * step + p.random(-JITTER * k, JITTER * k);
          const y = start + row * step + p.random(-JITTER * k, JITTER * k);
          p.text("\u{1F4BF}", x, y);
        }
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(size, size);
      p.textSize(TEXT_SIZE * k);
      p.textAlign(p.CENTER, p.CENTER);
      drawAll();

      // 加上點擊重製：綁在 canvas 元素上避免點畫布外誤觸，重新抽一次底色與抖動。
      canvas.mousePressed(() => {
        drawAll();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveCanvas("MoireDiscShadows", "png");
      }
    };
  };
}
