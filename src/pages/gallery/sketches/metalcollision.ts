import type p5 from "p5";
import Matter from "matter-js";

// 原稿「金屬碰撞」用 Matter.js 做 2D 物理：每 20 幀從上方隨機位置掉下一個 3~7 邊
// 多邊形（HSB 色相跟出生 x 位置走），落進地板跟左右牆圍成的池子裡堆疊碰撞；每個
// 多邊形帶一顆跟著旋轉的半圓眼睛，滑鼠可抓取拖曳，被抓住的方塊變灰、眼睛瞪成全圓。
//
// 原稿在 OpenProcessing 用 <script> 注入 CDN 版 matter-js，這裡改用 npm 套件
// import，只保留實際驅動物理的 draw() 裡 Engine.update()。原稿吃 windowWidth/
// windowHeight 滿版視窗，多邊形、牆厚、眼睛尺寸都是絕對像素值，統一乘上
// k = width / REFERENCE_WIDTH 等比例縮放。
const REFERENCE_WIDTH = 1872;

// Matter.Body 掛的自訂欄位：color/sz 沿用原稿直接塞屬性的做法，outFrames 是
// 移植加的，記錄方塊連續待在畫布外的幀數。
type EyeBody = Matter.Body & {
  color?: p5.Color;
  sz?: number;
  outFrames?: number;
};

// 被甩出牆外或堆到冒出頂端的方塊會一路留在引擎裡白白吃效能。連續出界超過此幀數
// （60fps 下約 2 秒）就從物理世界跟繪製清單移除；正被滑鼠抓著的不算。
const OUT_OF_BOUNDS_LIMIT = 120;

export function createMetalCollisionSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const wallThickness = 60 * k;

    const { Engine, Bodies, World, Mouse, MouseConstraint } = Matter;

    let engine: Matter.Engine;
    let mouseConstraint: Matter.MouseConstraint;
    const boxes: EyeBody[] = [];

    const generateNewBox = (x: number, y: number) => {
      const sz = p.random([40, 60, 80]) * k;
      const boxA: EyeBody = Bodies.polygon(x, y, p.int(p.random(3, 8)), sz);
      const hcolor = p.map(x, 0, width, 0, 360);
      boxA.color = p.color(hcolor, 80, 80);
      boxA.sz = sz;
      boxes.push(boxA);
      World.add(engine.world, boxA);
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background(0);
      p.colorMode(p.HSB);

      // 地板跟左右牆都以中心為基準，往外推自身厚度的一半，讓內緣剛好貼齊畫布邊。
      const ground = Bodies.rectangle(
        width / 2,
        height + wallThickness / 2,
        width,
        wallThickness,
        { isStatic: true },
      );
      const wallLeft = Bodies.rectangle(
        0 - wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        { isStatic: true },
      );
      const wallRight = Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        { isStatic: true },
      );
      engine = Engine.create();

      // canvas 內部像素是 CSS 尺寸乘上 pixelDensity，Matter Mouse 換算座標要靠
      // data-pixel-ratio 屬性讀這個比例，不設在 hiDPI 螢幕上抓取位置會偏掉。
      canvas.elt.setAttribute("data-pixel-ratio", String(p.pixelDensity()));
      const mouse = Mouse.create(canvas.elt);
      mouseConstraint = MouseConstraint.create(engine, { mouse });
      World.add(engine.world, mouseConstraint);

      boxes.push(ground);
      boxes.push(wallLeft);
      boxes.push(wallRight);
      World.add(engine.world, boxes);
    };

    p.draw = () => {
      p.background(0);
      // 減緩物體新增速度
      if (p.frameCount % 20 === 0) {
        generateNewBox(p.random(0, width), 80 * k);
      }
      Matter.Engine.update(engine);

      // 出界過久的方塊移除（見 OUT_OF_BOUNDS_LIMIT）。判斷放寬一顆最大方塊的
      // 距離，避免邊緣彈跳、探頭的被誤殺。
      const outMargin = 80 * k;
      for (let i = boxes.length - 1; i >= 0; i--) {
        const box = boxes[i];
        if (box.isStatic || mouseConstraint.constraint.bodyB === box) continue;
        const isOut =
          box.position.x < -outMargin ||
          box.position.x > width + outMargin ||
          box.position.y < -outMargin ||
          box.position.y > height + outMargin;
        box.outFrames = isOut ? (box.outFrames ?? 0) + 1 : 0;
        if (box.outFrames > OUT_OF_BOUNDS_LIMIT) {
          World.remove(engine.world, box);
          boxes.splice(i, 1);
        }
      }

      for (const box of boxes) {
        p.stroke(128);
        p.strokeWeight(2 * k);
        if (box.color) {
          p.fill(box.color);
        } else {
          p.fill("white");
        }

        const mouseIsDragging = mouseConstraint.constraint.bodyB === box;
        if (mouseIsDragging) {
          p.fill("gray");
        }

        p.beginShape();
        for (const vert of box.vertices) {
          p.vertex(vert.x, vert.y);
        }
        p.endShape(p.CLOSE);

        p.push();
        p.translate(box.position.x, box.position.y);
        // 跟著旋轉的眼睛，被抓住時從半圓瞪成全圓
        p.rotate(box.angle);
        if (box.sz) {
          p.stroke(0);
          p.strokeWeight(2 * k);
          p.fill(255);
          p.arc(0, 0, 30 * k, 30 * k, 0, mouseIsDragging ? 2 * p.PI : p.PI);

          p.fill(0);
          p.arc(0, 0, 10 * k, 10 * k, 0, mouseIsDragging ? 2 * p.PI : p.PI);
        }
        p.pop();
      }
    };

    // 原稿沒有存檔鍵，這裡補上跟其他作品一致的 S 儲存。
    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Metal_collision", "png", 1, 1);
      }
    };
  };
}
