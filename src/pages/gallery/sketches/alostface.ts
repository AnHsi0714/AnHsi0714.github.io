import type p5 from "p5";

// 原稿「迷茫的臉」用 windowWidth/windowHeight 畫滿視窗，draw() 每幀（10fps）
// 完全重畫：清背景、重新亂數擺放眼睛嘴巴鼻子，本身就是持續變動的生成動畫，
// 不需額外點擊互動。改寫成 instance mode，width/height 從外部傳入。原稿另定義
// drawW()、addScratch() 但 draw() 從未呼叫，屬未用到的殘留程式碼，未搬過來。
//
// 圓圈直徑、眼球大小、嘴巴／鼻子尺寸與各處亂數位移量是原稿針對「視窗寬
// ~1872px」寫死的像素值，統一乘上 k = width / REFERENCE_WIDTH 等比例縮小。
const REFERENCE_WIDTH = 1872;

export function createALostFaceSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;

    const setEyeBall = (x: number, y: number, s: number) => {
      p.push();
      p.translate(x, y);
      p.stroke("#222");
      p.noFill();

      for (let i = 0; i < 50; i++) {
        p.push();
        p.rotate(p.random(-0.75, 0.75));
        p.strokeWeight(p.random(0.5, 2));

        const ox = p.random(-8, 8) * k;
        const oy = p.random(-8, 8) * k;

        p.line(
          -s / 2 + ox,
          -s / 2 + oy,
          s / 2 + p.random(-5, 5) * k,
          s / 2 + p.random(-5, 5) * k,
        );

        p.line(
          s / 2 + p.random(-5, 5) * k,
          -s / 2 + p.random(-5, 5) * k,
          -s / 2 + p.random(-5, 5) * k,
          s / 2 + p.random(-5, 5) * k,
        );

        p.pop();
      }

      p.pop();
    };

    const setEyes = () => {
      const eyesMargin = 30 * k;

      for (let i = 0; i < 1000; i++) {
        p.stroke("#000000");
        p.fill(100);
        p.circle(
          eyesMargin + width / 4 + p.random(-30, 30) * k,
          height / 3 + p.random(-30, 30) * k,
          500 * k,
        );
      }
      setEyeBall(
        eyesMargin + width / 4 + p.random(-30, 30) * k,
        height / 3 + p.random(-30, 30) * k,
        50 * k,
      );

      for (let i = 0; i < 1000; i++) {
        p.stroke("#000000");
        p.fill(100);
        p.circle(
          eyesMargin + (width / 4) * 3 + p.random(-30, 30) * k,
          height / 3 + p.random(-30, 30) * k,
          500 * k,
        );
      }
      setEyeBall(
        eyesMargin + (width / 4) * 3 + p.random(-30, 30) * k,
        height / 3 + p.random(-30, 30) * k,
        50 * k,
      );
    };

    const setWMouth = (x: number, y: number, w: number, h: number) => {
      p.stroke("#555");
      p.noFill();

      for (let i = 0; i < 50; i++) {
        if (p.random() < 0.4) continue;
        p.strokeWeight(p.random(0.5, 2));

        p.beginShape();
        p.vertex(x + p.random(-8, 8) * k, y + p.random(-8, 8) * k);
        p.vertex(
          x + w * 0.25 + p.random(-12, 12) * k,
          y + h + p.random(-12, 12) * k,
        );
        p.vertex(x + w * 0.5 + p.random(-12, 12) * k, y + p.random(-8, 8) * k);
        p.vertex(
          x + w * 0.75 + p.random(-12, 12) * k,
          y + h + p.random(-12, 12) * k,
        );
        p.vertex(x + w + p.random(-8, 8) * k, y + p.random(-8, 8) * k);
        p.endShape();
      }
    };

    const setNose = (x: number, y: number, s: number) => {
      p.stroke("#999");
      p.noFill();

      for (let i = 0; i < 250; i++) {
        p.strokeWeight(p.random(0.5, 2));

        p.beginShape();
        p.vertex(x + p.random(-4, 4) * k, y - s * 0.45 + p.random(-4, 4) * k);
        p.quadraticVertex(
          x - s * 0.18 + p.random(-8, 8) * k,
          y - s * 0.1 + p.random(-8, 8) * k,
          x + p.random(-6, 6) * k,
          y + s * 0.08 + p.random(-6, 6) * k,
        );
        p.endShape();
      }
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.background("#222");
      p.frameRate(10);
    };

    p.draw = () => {
      p.background("#222");
      setEyes();
      setWMouth(width / 2 - 80 * k, height * 0.8, 160 * k, 40 * k);
      setNose(width / 2, height * 0.58, 70 * k);
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("ALostFace", "png", 1, 1);
      }
    };
  };
}
