import type p5 from "p5";

// 原稿「音頻」用 windowWidth/windowHeight 畫滿整個瀏覽器視窗、且沒有 draw()，
// 只在 setup() 畫一次靜態構圖（見對話紀錄）；改寫成 instance mode，
// width/height 從外部傳入。
//
// 原稿的半徑成長範圍（10~140px）、水平偏移量（20~35px／次）都是針對「視窗寬度
// ~1872px」寫死的絕對像素值。半徑成長很慢（rrate=1.005，要跑約 500 次迴圈才到
// 140px），水平偏移累積下來達數千像素，遠超過展場畫布的寬度——在原尺寸視窗下
// 這個形狀本來就會畫出視窗外，只有中段落在畫面內；但展場畫布比原視窗窄很多，
// 同樣的絕對位移換算下來，畫面內能看到的比例就變得更小、更像「兩側被裁掉」。
// 統一乘上 k = width / REFERENCE_WIDTH 把這些絕對像素常數等比例縮小，維持跟
// 原稿相同的相對可見比例。
const REFERENCE_WIDTH = 1872;

export function createAudioSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const audio1 = () => {
      p.blendMode(p.BLEND);
      const bacColor = p.color("#222");
      p.background(bacColor);
      p.noStroke();
      p.frameRate(0.5);

      if (p.random() < 0.5) {
        p.blendMode(p.DIFFERENCE);
      } else {
        p.blendMode(p.SCREEN);
      }

      const shapeCount = 6;
      const points: { x: number; y: number }[] = [{ x: 0, y: 0 }];

      for (let i = 1; i <= shapeCount / 2; i++) {
        const tmpx = width / 2;
        const tmpy =
          p.map(i, 1, shapeCount / 2, height * 0.15, height * 0.45) +
          p.random(-height * 0.1, height * 0.1);
        points.push({ x: tmpx, y: tmpy });
      }
      for (let i = shapeCount / 2 + 1; i <= shapeCount; i++) {
        const tmpx = width / 2;
        const tmpy = points[i - shapeCount / 2].y;
        points.push({ x: tmpx, y: tmpy });
      }

      for (let i = 1; i <= shapeCount; i++) {
        let r = 10 * k;
        let x = points[i].x;
        let y1 = points[i].y;
        let y2 = points[i].y * 2;
        const rrate = 1.005;
        const irate = p.random(0.05, 0.5);
        let iloop = 10;

        if (rrate > 1) {
          const clr1 = p.color(p.random(0, 360), 80, 100);
          const clr2 = p.color(p.random(0, 360), 80, 100);
          const rtmp = 140 * k;
          while (r <= rtmp) {
            const ratio = p.map(r, rtmp, 10 * k, 1, 0);
            const r2 = p.map(r, 150 * k, 200 * k, 10 * k, 50 * k);
            const midclr = p.lerpColor(clr1, clr2, ratio);
            p.fill(midclr);
            p.rect(x, y1, r, r2);
            p.rect(x, y2, r, r2);
            r *= rrate;

            const subx = p.map(irate, 0.05, 0.5, 20 * k, 35 * k);
            if (i <= shapeCount / 2) {
              x += subx;
            } else {
              x -= subx;
            }
            y1 += iloop * irate * k;
            y2 -= iloop * irate * k;
            iloop += 1;
          }
        }
      }

      p.blendMode(p.BLEND);
      p.fill("#fff");
      p.rect(width / 2, 0, 10 * k, height * 2);
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.rectMode(p.CENTER);
      p.colorMode(p.HSB);
      p.textAlign(p.CENTER);
      p.background("#222");
      p.textFont("Times New Roman", 500);
      audio1();
    };

    // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
    // 點畫布就重新跑一次 audio1() 換一組新的波形構圖。
    p.mousePressed = () => {
      audio1();
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Audio", "png", 1, 1);
      }
    };
  };
}
