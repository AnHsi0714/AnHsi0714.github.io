import type p5 from "p5";

// 原稿「RPS」是猜拳生態模擬：24 個方塊分剪刀（0）、石頭（1）、布（2）三種，在固定
// 1800x900 畫布裡彈跳，相撞時輸家被同化成贏家種類；每幀累加數量進 scores，
// 全場只剩一種時凍結比分、顯示贏家。
//
// 原稿 Box class 沒有留存，依截圖（public/images/gallery/RPS0.jpg、RPS1.jpg）
// 重建：40px 方塊、黑色粗框、依種類填色，中間畫黑色 SVG 圖示，碰邊界反彈。
//
// 方塊大小、速度、文字大小位置都是針對 1800 寬寫死的絕對像素值，統一乘上
// k = width / REFERENCE_WIDTH 等比例縮放。
const REFERENCE_WIDTH = 1800;

// 圖示來源：https://www.svgrepo.com/（原稿註記），放在 public/ 下 same-origin 載入。
const IMG_URLS = [
  "/images/gallery/RPS/scissors.svg",
  "/images/gallery/RPS/hand-rock-solid.svg",
  "/images/gallery/RPS/hand-with-fingers-splayed.svg",
];

// 種類顏色跟計分文字一致：剪刀、石頭、布。
const TYPE_COLORS = ["#c7efcf", "#e63462", "#fe5f55"];
const TYPE_NAMES = ["Scissors", "Rock", "Paper"];

interface Box {
  size: number;
  p: p5.Vector;
  v: p5.Vector;
  type: number;
}

export function createRPSSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const imgs: p5.Image[] = [];
    let shapes: Box[] = [];
    let scores: number[] = [];

    const spawnShapes = () => {
      shapes = [];
      scores = [0, 0, 0];
      const size = 40 * k;
      for (let i = 0; i < 24; i++) {
        // 原稿用 p5.Vector.random2D().mult(5)，type-only import 拿不到靜態方法，
        // 改用等價的隨機角度單位向量。
        const angle = p.random(p.TWO_PI);
        shapes.push({
          size,
          p: p.createVector(
            p.random(size, width - size),
            p.random(size, height - size),
          ),
          v: p.createVector(Math.cos(angle), Math.sin(angle)).mult(5 * k),
          type: i % 3,
        });
      }
    };

    const drawBox = (box: Box) => {
      p.strokeWeight(3 * k);
      p.stroke(0);
      p.fill(TYPE_COLORS[box.type]);
      p.rect(box.p.x - box.size / 2, box.p.y - box.size / 2, box.size, box.size);
      const pad = box.size * 0.1;
      p.image(
        imgs[box.type],
        box.p.x - box.size / 2 + pad,
        box.p.y - box.size / 2 + pad,
        box.size - pad * 2,
        box.size - pad * 2,
      );
    };

    const updateBox = (box: Box) => {
      box.p.add(box.v);
      const half = box.size / 2;
      if (box.p.x < half || box.p.x > width - half) box.v.x *= -1;
      if (box.p.y < half || box.p.y > height - half) box.v.y *= -1;
    };

    const isBoxHitting = (a: Box, b: Box) =>
      Math.abs(a.p.x - b.p.x) < a.size && Math.abs(a.p.y - b.p.y) < a.size;

    // 猜拳規則：type+1 克 type（石頭克剪刀、布克石頭），差 2 是剪刀（0）對布（2）
    // 剪刀贏，輸家改成贏家種類。
    const resolveHit = (a: Box, b: Box) => {
      if (a.type === b.type) return;
      if (a.type === b.type + 1) {
        b.type = a.type;
      } else if (b.type === a.type + 1) {
        a.type = b.type;
      } else if (a.type === 0) {
        b.type = a.type;
      } else {
        a.type = b.type;
      }
    };

    const isWin = () => shapes.every((s) => s.type === shapes[0].type);

    p.preload = () => {
      for (const url of IMG_URLS) {
        imgs.push(p.loadImage(url));
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      spawnShapes();

      // 原稿分出勝負後就停在贏家畫面，這裡加上點擊重製：綁在 canvas 元素，
      // 點畫布內重開一局、比分歸零。
      canvas.mousePressed(() => {
        spawnShapes();
      });
    };

    p.draw = () => {
      p.background(128);

      const typeCount = [0, 0, 0];
      for (let i = 0; i < shapes.length; i++) {
        drawBox(shapes[i]);
        updateBox(shapes[i]);
        for (let j = i + 1; j < shapes.length; j++) {
          if (isBoxHitting(shapes[i], shapes[j])) {
            resolveHit(shapes[i], shapes[j]);
          }
        }
      }
      for (const shape of shapes) {
        typeCount[shape.type] += 1;
      }

      if (isWin()) {
        p.textAlign(p.CENTER);
        p.textSize(32 * k);
        p.stroke("#333745");
        p.fill("#eef5db");
        if (scores[0] > scores[1] && scores[0] > scores[2]) {
          p.text("Scissors Win", width / 2, height / 2);
        } else if (scores[1] > scores[0] && scores[1] > scores[2]) {
          p.text("Rock Win", width / 2, height / 2);
        } else if (scores[2] > scores[1] && scores[2] > scores[0]) {
          p.text("Paper Win", width / 2, height / 2);
        } else {
          p.text("Tie", width / 2, height / 2);
        }
      } else {
        // 場中央的即時數量：文字顏色跟著目前佔多數的種類走，平手用米白。
        p.textAlign(p.CENTER);
        p.textSize(32 * k);
        p.stroke("#333745");
        if (typeCount[0] > typeCount[1] && typeCount[0] > typeCount[2]) {
          p.fill(TYPE_COLORS[0]);
        } else if (typeCount[1] > typeCount[2] && typeCount[1] > typeCount[0]) {
          p.fill(TYPE_COLORS[1]);
        } else if (typeCount[2] > typeCount[0] && typeCount[2] > typeCount[1]) {
          p.fill(TYPE_COLORS[2]);
        } else {
          p.fill("#eef5db");
        }
        for (let i = 0; i < 3; i++) {
          scores[i] += typeCount[i];
        }
        for (let i = 0; i < 3; i++) {
          p.text(
            `${TYPE_NAMES[i]}:${typeCount[i]}`,
            width / 2,
            (100 + i * 100) * k,
          );
        }
      }

      p.textAlign(p.LEFT);
      p.textSize(24 * k);
      for (let i = 0; i < 3; i++) {
        p.fill(TYPE_COLORS[i]);
        p.text(
          `${TYPE_NAMES[i]} score:${scores[i]}`,
          30 * k,
          (50 + i * 50) * k,
        );
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("RPS", "png", 1, 1);
      }
    };
  };
}
