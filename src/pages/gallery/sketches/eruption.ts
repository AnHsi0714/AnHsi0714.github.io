import type p5 from "p5";

// 原稿「爆發」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗（見對話紀錄），
// 200 顆球從畫面中心炸開、碰到邊界反彈；draw() 裡完全沒有清背景，所以球的殘影
// 會一直疊在畫布上，越疊越密——這是這件作品的核心視覺效果，不能加上每幀清除
// 背景，否則會變成單純的彈跳動畫，失去「爆發」的堆疊感。
//
// 原稿的球半徑（10~100px）、初速（±1px/frame）都是針對「視窗寬度 ~1872px」
// 寫死的絕對像素值，統一乘上 k = width / REFERENCE_WIDTH 等比例縮小。
const REFERENCE_WIDTH = 1872;
const COLORS = ["#333745", "#e63462", "#fe5f55", "#c7efcf", "#eef5db"];

interface Ball {
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export function createEruptionSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    let balls: Ball[] = [];

    const spawnBalls = () => {
      balls = [];
      for (let i = 0; i < 200; i++) {
        balls.push({
          r: p.random(10, 100) * k,
          x: width / 2,
          y: height / 2,
          vx: p.random(-1, 1) * k,
          vy: p.random(-1, 1) * k,
          color: p.random(COLORS),
        });
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background(0);
      spawnBalls();

      // 原稿只在 setup() 生一次球群，之後就一路彈跳累積殘影（見對話紀錄），
      // 這裡加上點擊重製：綁在 canvas 元素本身，點畫布內清空殘影、重新從
      // 中心炸出一批新的球。
      canvas.mousePressed(() => {
        p.background(0);
        spawnBalls();
      });
    };

    p.draw = () => {
      p.noStroke();
      for (const ball of balls) {
        p.fill(ball.color);
        p.ellipse(ball.x, ball.y, ball.r);
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.y < 0 || ball.y > height) ball.vy *= -1;
        if (ball.x < 0 || ball.x > width) ball.vx *= -1;
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Eruption", "png", 1, 1);
      }
    };
  };
}
