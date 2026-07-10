import type p5 from "p5";

// 原稿「污染」載入一張海洋背景圖跟一張雜訊材質圖疊加做色偏效果，
// 畫布大小直接吃圖片的原始寬高，不是滿版視窗。素材放在
// public/images/gallery/pollute/ 下，用 same-origin 路徑載入——原稿另外兩個
// 素材檔放在 OpenProcessing 的 CDN 上沒有 CORS header，直接跨網域載入的話
// img.get() 讀像素會因為 canvas 被 taint 而丟例外，所以必須自己放一份。
const OCEAN_URL = "/images/gallery/pollute/ocean.png";
const NOISE_URL = "/images/gallery/pollute/noise2.png";

export function createPolluteSketch(width: number, height: number) {
  return (p: p5) => {
    let img: p5.Image;
    let noiseImg: p5.Image;

    // 原稿的取樣格子大小（10px）是針對圖片原始寬度寫死的絕對像素值，這裡用
    // k = 展場畫布寬 / 圖片原始寬度 等比例縮放，讓格子在縮小的展場畫布上仍保持
    // 跟原稿一致的相對比例。
    const drawPollute = () => {
      const k = width / img.width;
      const rsize = 10 * k;

      p.frameRate(0.5);
      p.noStroke();
      p.background("black");
      p.rectMode(p.CENTER);

      const rndclrR = p.int(p.random(0, 150));
      const rndclrG = p.int(p.random(100, 150));
      const rndclrB = p.int(p.random(0, 150));

      for (let i = 0; i < img.width; i += 10) {
        for (let j = 0; j < img.height; j += 10) {
          const c = img.get(i, j);
          p.fill(
            (c[0] + rndclrR) % 256,
            (c[1] + rndclrG) % 256,
            (c[2] + rndclrB) % 256,
          );
          p.rect(i * k + p.random(-2, 2), j * k + p.random(-2, 2), rsize);
        }
      }

      p.push();
      p.blendMode(p.MULTIPLY);
      p.image(noiseImg, 0, 0, width, height);
      p.pop();
    };

    p.preload = () => {
      img = p.loadImage(OCEAN_URL);
      noiseImg = p.loadImage(NOISE_URL);
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      p.background("black");
      p.image(img, 0, 0, width, height);
      drawPollute();

      // 原稿只在 setup() 畫一次靜態構圖（見對話紀錄），這裡加上點擊重製：
      // 綁在 canvas 元素本身（而非 p.mousePressed），這樣只有點在畫布內才會
      // 重新跑一次 drawPollute() 換一組新的色偏。
      canvas.mousePressed(() => {
        drawPollute();
      });
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Pollute", "png", 1, 1);
      }
    };
  };
}
