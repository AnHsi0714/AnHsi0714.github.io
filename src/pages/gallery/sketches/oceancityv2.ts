import type p5 from "p5";

// 原稿「海底城市v2」改寫成 instance mode，size 從外部傳入。城市背景只在
// setup() 畫一次到離屏 cityLayer，draw() 每幀貼回畫布；魚群/飼料/氣泡是持續
// 跑的動畫狀態，收在工廠函式的閉包裡避免多實例共用全域陣列。滑鼠拖曳灑飼
// 料，魚會自動找最近的飼料游過去。
//
// 大部分尺寸常數都是針對「900px 見方」寫死的絕對像素值，統一乘上
// k = size / REFERENCE_SIZE 等比例縮放，讓畫布不管多大都維持原本的相對比例。
const REFERENCE_SIZE = 900;

const colors = ["#4DE2D4", "#4BEAFB", "#00A6A9"];

// 窗戶三色分工：窗框、未點燈玻璃、點燈玻璃用不同顏色，避免糊在一起
const WINDOW_LIT_CHANCE = 0.3;
const WINDOW_LIT_COLOR = "#FFD98A";
const WINDOW_UNLIT_COLOR = "#0B222B";
const WINDOW_FRAME_COLOR = "#BFE3EA";

// 吃到飼料後有機率變大，長到這個大小就不再繼續長
const FISH_GROWTH_CHANCE = 0.35;
const FISH_MAX_SIZE = 30;

// 城市密度：CELL_STRIDE 越大，候選格越少、建築間距越大（2 = 每隔一格）；
// EMPTY_CHANCE 是候選格留白不放建築的機率；DISTANT_BUILDING_COUNT 是背景遠
// 景建築的數量
const CELL_STRIDE = 2;
const EMPTY_CHANCE = 0.3;
const DISTANT_BUILDING_COUNT = 25;

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  movementSpeed: number;
  acceleration: number;
  size: number;
  offset: number;
  wander: number;
  alpha: number;
  color: string;
}

interface Food {
  x: number;
  y: number;
  size: number;
  movementSpeed: number;
  offset: number;
  landed: boolean;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  movementSpeed: number;
  alpha: number;
  offset: number;
}

export function createOceanCityV2Sketch(size: number) {
  return (p: p5) => {
    const k = size / REFERENCE_SIZE;

    let cityLayer: p5.Graphics;
    const fishes: Fish[] = [];
    const fishCount = 40;
    const foods: Food[] = [];
    const bubbles: Bubble[] = [];
    let nextBubble = 0;

    // 每棟樓抽一次基底色，用固定明暗係數模擬統一光源（頂面最亮、牆面較暗）
    const shadeColor = (
      base: string,
      factor: number,
    ): [number, number, number] => {
      const c = p.color(base);
      return [
        p.constrain(p.red(c) * factor, 0, 255),
        p.constrain(p.green(c) * factor, 0, 255),
        p.constrain(p.blue(c) * factor, 0, 255),
      ];
    };

    // 把 total 切成隨機寬窄的幾份，總和精確等於 total，窗距才會大小不一又不
    // 留零碎縫隙
    const randomSegments = (total: number, avgStep: number): number[] => {
      const count = Math.max(1, Math.round(total / avgStep));
      const raw = Array.from({ length: count }, () => p.random(0.6, 1.5));
      const rawSum = raw.reduce((sum, v) => sum + v, 0);
      return raw.map((v) => (v / rawSum) * total);
    };

    // 在以 (cx, cy) 為中心、寬 w 高 h 的面上切出窗戶，四邊留白（底部留最多，
    // 當牆基），窗距用 randomSegments 產生大小不一
    const drawWindows = (
      pg: p5.Graphics,
      cx: number,
      cy: number,
      w: number,
      h: number,
      step: number,
    ) => {
      const sideMargin = w * 0.12;
      const topMargin = h * 0.1;
      const bottomMargin = h * 0.2;

      const usableW = Math.max(step, w - sideMargin * 2);
      const usableH = Math.max(step, h - topMargin - bottomMargin);
      const areaLeft = cx - usableW / 2;
      const areaTop = cy - h / 2 + topMargin;

      const colWidths = randomSegments(usableW, step);
      const rowHeights = randomSegments(usableH, step);

      pg.stroke(WINDOW_FRAME_COLOR);
      pg.strokeWeight(0.6 * k);

      let xOffset = areaLeft;
      for (const colW of colWidths) {
        let yOffset = areaTop;
        for (const rowH of rowHeights) {
          const wx = xOffset + colW / 2;
          const wy = yOffset + rowH / 2;
          pg.fill(
            p.random() < WINDOW_LIT_CHANCE
              ? WINDOW_LIT_COLOR
              : WINDOW_UNLIT_COLOR,
          );
          pg.rect(wx, wy, colW * 0.6, rowH * 0.6);
          yOffset += rowH;
        }
        xOffset += colW;
      }
    };

    // 純函式手動算出等角地面座標（取代 pg.rotate/shearX/scale 整個斜切
    // context 的做法），讓「高度」能單純是算完地面座標後再往螢幕 -y 平移的
    // 量，不會連帶放大地面範圍，也不需要整張旋轉來喬哪個面該在上面。
    const ISO_SX = Math.sqrt(2) / Math.sqrt(3);
    const ISO_SY = Math.sqrt(2) / 2;
    const ISO_SHEAR_TAN = Math.tan((-30 * Math.PI) / 180);
    const ISO_COS30 = Math.cos((30 * Math.PI) / 180);
    const ISO_SIN30 = Math.sin((30 * Math.PI) / 180);

    const isoTransform = (px: number, py: number): [number, number] => {
      let x = (px - size / 2) * ISO_SX;
      let y = (py - size / 2) * ISO_SY;
      x = x + y * ISO_SHEAR_TAN;
      const rx = x * ISO_COS30 - y * ISO_SIN30;
      const ry = x * ISO_SIN30 + y * ISO_COS30;
      return [rx + size / 2, ry + size / 2];
    };

    // 把地面一條邊拉高成一片牆，再用 applyMatrix 把牆的邊向量設成 drawWindows
    // 的局部座標系，不用改 drawWindows 就能畫在正確的斜面上
    const drawWall = (
      pg: p5.Graphics,
      ax: number,
      ay: number,
      bx: number,
      by: number,
      height: number,
      color: [number, number, number],
      windowStep: number,
    ) => {
      const topAx = ax;
      const topAy = ay - height;
      const topBx = bx;
      const topBy = by - height;

      pg.noStroke();
      pg.fill(...color);
      pg.quad(topAx, topAy, topBx, topBy, bx, by, ax, ay);

      const faceW = Math.hypot(bx - ax, by - ay);
      const faceH = height;
      const centerX = (ax + bx) / 2;
      const centerY = (ay + by) / 2 - height / 2;

      pg.push();
      pg.applyMatrix(
        (bx - ax) / faceW,
        (by - ay) / faceW,
        0,
        -1,
        centerX,
        centerY,
      );
      drawWindows(pg, 0, 0, faceW, faceH, windowStep);
      pg.pop();
    };

    const drawIsoBox = (
      pg: p5.Graphics,
      gx: number,
      gy: number,
      halfW: number,
      halfD: number,
      height: number,
    ) => {
      const base = p.random(colors);
      const windowStep = p.random(8, 22) * k;

      const roofColor = shadeColor(base, 1.15);
      const wallColorRight = shadeColor(base, 0.75);
      const wallColorLeft = shadeColor(base, 0.5);

      const [nx, ny] = isoTransform(gx + halfW, gy + halfD); // 最靠近觀眾的地面角
      const [rx, ry] = isoTransform(gx + halfW, gy - halfD); // 右側地面角
      const [lx, ly] = isoTransform(gx - halfW, gy + halfD); // 左側地面角
      const [fx, fy] = isoTransform(gx - halfW, gy - halfD); // 被擋住的最遠地面角，畫屋頂用

      // 屋頂：所有牆面裡最亮的一片，不開窗，維持乾淨的亮面
      pg.noStroke();
      pg.fill(...roofColor);
      pg.quad(
        fx,
        fy - height,
        rx,
        ry - height,
        nx,
        ny - height,
        lx,
        ly - height,
      );

      // 右牆、左牆都在最近的地面角（nx, ny）交會，各自往上拉高、開窗
      drawWall(pg, rx, ry, nx, ny, height, wallColorRight, windowStep);
      drawWall(pg, lx, ly, nx, ny, height, wallColorLeft, windowStep);
    };

    interface BuildingSpec {
      gx: number;
      gy: number;
      halfW: number;
      halfD: number;
      height: number;
    }

    const drawCity = (pg: p5.Graphics) => {
      pg.background("#08121A");

      const area = size * 2;
      const cellCount = 9;
      const cellSize = area / cellCount;
      const side = cellSize / 2;
      const halfSide = side / 2;
      const specs: BuildingSpec[] = [];

      for (let i = 0; i < DISTANT_BUILDING_COUNT; i++) {
        const x = p.random(-100 * k, size + 100 * k);
        const y = p.random(-100 * k, size + 100 * k);
        specs.push({
          gx: x,
          gy: y,
          halfW: halfSide,
          halfD: halfSide,
          height: p.random(20, 70) * k,
        });
      }

      // 只在 i、j 都是 CELL_STRIDE 倍數的格子放建築，直接拉開間距、減少數量
      for (let i = 0; i <= cellCount; i += CELL_STRIDE) {
        for (let j = 0; j <= cellCount; j += CELL_STRIDE) {
          const x = i * cellSize + cellSize / 2 + (size - area) / 2;
          const y = j * cellSize + cellSize / 2 + (size - area) / 2;
          const pattern = p.random();
          const filled = (1 - EMPTY_CHANCE) / 3;

          if (pattern < EMPTY_CHANCE) {
            // 留白
            continue;
          } else if (pattern < EMPTY_CHANCE + filled) {
            // 雙棟：分居對角象限，跟象限本身一樣大，彼此天生就碰不到
            specs.push({
              gx: x - side / 2,
              gy: y + side / 2,
              halfW: halfSide,
              halfD: halfSide,
              height: side * p.random(0.8, 1.3),
            });
            specs.push({
              gx: x + side / 2,
              gy: y - side / 2,
              halfW: halfSide,
              halfD: halfSide,
              height: side * p.random(0.8, 1.3),
            });
          } else if (pattern < EMPTY_CHANCE + filled * 2) {
            // 高樓：跟其他量體同樣佔一個象限大小，只有高度拉高
            specs.push({
              gx: x,
              gy: y,
              halfW: halfSide,
              halfD: halfSide,
              height: side * p.random(1.3, 2.2),
            });
          } else {
            // 單棟：佔一個象限，角落定位
            const toLeft = p.random() < 0.5;
            const toTop = p.random() < 0.5;
            specs.push({
              gx: x + (toLeft ? -side / 2 : side / 2),
              gy: y + (toTop ? -side / 2 : side / 2),
              halfW: halfSide,
              halfD: halfSide,
              height: side * p.random(0.8, 1.4),
            });
          }
        }
      }

      // 畫布上「較高」代表較遠、「較低」代表離觀眾較近（isoTransform 底下 i、j
      // 同時增加會讓螢幕 y 變大），所以照每棟樓地面中心轉換後的螢幕 y 由小到大
      // 排序：遠的先畫、近的後畫蓋在上面，才是正確的疊放順序。這個 y 值本來就
      // 是最終畫面上的實際位置，遠景建築（隨機座標，不在格子網格上）跟街區建
      // 築用同一份清單、同一個規則排序，不需要分開處理。
      specs.sort(
        (a, b) => isoTransform(a.gx, a.gy)[1] - isoTransform(b.gx, b.gy)[1],
      );

      for (const spec of specs) {
        drawIsoBox(pg, spec.gx, spec.gy, spec.halfW, spec.halfD, spec.height);
      }
    };

    const updateFishes = () => {
      for (const fish of fishes) {
        let targetX: number;
        let targetY: number;

        // 找最近的飼料
        if (foods.length > 0) {
          let closestFood = foods[0];
          let closestDistance = p.dist(
            fish.x,
            fish.y,
            closestFood.x,
            closestFood.y,
          );

          for (const food of foods) {
            const d = p.dist(fish.x, fish.y, food.x, food.y);
            if (d < closestDistance) {
              closestFood = food;
              closestDistance = d;
            }
          }

          targetX = closestFood.x;
          targetY = closestFood.y;
        } else {
          // 沒有飼料：自然游動，混入一點往中心飄的偏移，避免吃完牆角的飼料
          // 後純靠亂走要繞很久才能飄回中間
          const angle = p.noise(fish.wander, p.frameCount * 0.0015) * 360;
          const wanderX = fish.x + p.cos(angle) * 100 * k;
          const wanderY = fish.y + p.sin(angle) * 100 * k;

          const distFromCenter = p.dist(fish.x, fish.y, size / 2, size / 2);
          const centerPull =
            p.constrain(distFromCenter / (size * 0.35), 0, 1) * 0.4;

          targetX = p.lerp(wanderX, size / 2, centerPull);
          targetY = p.lerp(wanderY, size / 2, centerPull);
        }

        // 朝目標方向
        let dx = targetX - fish.x;
        let dy = targetY - fish.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget > 0.5) {
          dx /= distanceToTarget;
          dy /= distanceToTarget;
          const boost = foods.length > 0 ? 2 : 1;
          fish.vx += dx * fish.acceleration * boost;
          fish.vy += dy * fish.acceleration * boost;
        }

        // 無飼料時自然漂移
        if (foods.length === 0) {
          fish.vx += p.sin(p.frameCount * 0.8 + fish.offset) * 0.008 * k;
          fish.vy += p.cos(p.frameCount * 0.7 + fish.offset) * 0.008 * k;
        }

        // 邊界力
        const boundaryMargin = 18 * k;
        const boundaryForce = 0.045 * k;

        if (fish.x < boundaryMargin) {
          fish.vx += boundaryForce * (1 - fish.x / boundaryMargin);
        }
        if (fish.x > size - boundaryMargin) {
          fish.vx -=
            boundaryForce *
            ((fish.x - (size - boundaryMargin)) / boundaryMargin);
        }
        if (fish.y < boundaryMargin) {
          fish.vy += boundaryForce * (1 - fish.y / boundaryMargin);
        }
        if (fish.y > size - boundaryMargin) {
          fish.vy -=
            boundaryForce *
            ((fish.y - (size - boundaryMargin)) / boundaryMargin);
        }

        // 限制最大速度
        const currentSpeed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
        const maxSpeed =
          foods.length > 0 ? fish.movementSpeed * 1.5 : fish.movementSpeed;
        if (currentSpeed > maxSpeed) {
          fish.vx = (fish.vx / currentSpeed) * maxSpeed;
          fish.vy = (fish.vy / currentSpeed) * maxSpeed;
        }

        // 阻尼
        fish.vx *= 0.985;
        fish.vy *= 0.985;

        // 移動
        fish.x += fish.vx;
        fish.y += fish.vy;

        // 邊界
        if (fish.x <= 0) {
          fish.x = 0;
          fish.vx = Math.abs(fish.vx);
        }
        if (fish.x >= size) {
          fish.x = size;
          fish.vx = -Math.abs(fish.vx);
        }
        if (fish.y <= 0) {
          fish.y = 0;
          fish.vy = Math.abs(fish.vy);
        }
        if (fish.y >= size) {
          fish.y = size;
          fish.vy = -Math.abs(fish.vy);
        }
      }

      // 魚吃掉飼料
      for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        let winner: Fish | null = null;
        let closestDistance = Infinity;

        for (const fish of fishes) {
          const d = p.dist(fish.x, fish.y, food.x, food.y);
          if (d < fish.size * 1.15 && d < closestDistance) {
            winner = fish;
            closestDistance = d;
          }
        }

        if (winner) {
          foods.splice(i, 1);

          if (p.random() < FISH_GROWTH_CHANCE) {
            winner.size = Math.min(
              winner.size + p.random(0.6, 1.6) * k,
              FISH_MAX_SIZE * k,
            );
          }
        }
      }
    };

    const drawFishes = () => {
      for (const fish of fishes) {
        p.push();
        p.translate(fish.x, fish.y);

        const angle = p.atan2(fish.vy, fish.vx);
        p.rotate(angle);

        const pulse = p.sin(p.frameCount * 2 + fish.offset) * 0.08 + 1;
        p.scale(pulse);

        const r = p.red(fish.color);
        const g = p.green(fish.color);
        const b = p.blue(fish.color);
        const s = fish.size;

        const bodyW = s * 1.8;
        const bodyH = s * 0.7;
        const tailW = s * 0.48;
        const tailH = s * 0.38;

        // 魚身光暈
        p.noStroke();
        p.fill(r, g, b, 25);
        p.beginShape();
        p.vertex(-bodyW / 2 - 3 * k, 0);
        p.vertex(0, -bodyH / 2 - 3 * k);
        p.vertex(bodyW / 2 + 3 * k, 0);
        p.vertex(0, bodyH / 2 + 3 * k);
        p.endShape(p.CLOSE);

        // 魚身
        p.fill(r, g, b, fish.alpha);
        p.beginShape();
        p.vertex(-bodyW / 2, 0);
        p.vertex(0, -bodyH / 2);
        p.vertex(bodyW / 2, 0);
        p.vertex(0, bodyH / 2);
        p.endShape(p.CLOSE);

        // 尾巴
        p.beginShape();
        p.vertex(-bodyW / 2 + 2 * k, 0);
        p.vertex(-bodyW / 2 - tailW, -tailH);
        p.vertex(-bodyW / 2 - tailW * 0.45, 0);
        p.vertex(-bodyW / 2 - tailW, tailH);
        p.endShape(p.CLOSE);

        // 魚身外框
        p.noFill();
        p.stroke(255, 245, 255, fish.alpha * 0.9);
        p.strokeWeight(0.8 * k);
        p.beginShape();
        p.vertex(-bodyW / 2, 0);
        p.vertex(0, -bodyH / 2);
        p.vertex(bodyW / 2, 0);
        p.vertex(0, bodyH / 2);
        p.vertex(-bodyW / 2, 0);
        p.endShape();

        // 尾巴外框
        p.beginShape();
        p.vertex(-bodyW / 2 + 2 * k, 0);
        p.vertex(-bodyW / 2 - tailW, -tailH);
        p.vertex(-bodyW / 2 - tailW * 0.45, 0);
        p.vertex(-bodyW / 2 - tailW, tailH);
        p.endShape();

        // 魚身中線
        p.stroke(255, 255, 255, fish.alpha * 0.45);
        p.strokeWeight(0.6 * k);
        p.line(-bodyW * 0.25, 0, bodyW * 0.35, 0);

        p.pop();
      }
    };

    const updateFoods = () => {
      for (const food of foods) {
        if (!food.landed) {
          food.y += food.movementSpeed;
          food.x += p.sin(p.frameCount * 1.5 + food.offset) * 0.18 * k;

          const radius = food.size / 2;
          const floorY = size - radius;
          if (food.y >= floorY) {
            food.y = floorY;
            food.landed = true;
          }
        }

        const radius = food.size / 2;
        food.x = p.constrain(food.x, radius, size - radius);
        food.y = p.constrain(food.y, radius, size - radius);
      }
    };

    const drawFoods = () => {
      for (const food of foods) {
        p.push();
        const pulse = p.sin(p.frameCount * 5 + food.offset) * 0.15 + 1;
        const foodSize = food.size * pulse;
        const glowSize = food.size * 2.5;

        p.noStroke();
        p.fill(255, 170, 80, 35);
        p.ellipse(food.x, food.y, glowSize, glowSize);

        p.fill(255, 215, 120, 245);
        p.ellipse(food.x, food.y, foodSize, foodSize);
        p.pop();
      }
    };

    const updateBubbles = () => {
      if (p.frameCount > nextBubble) {
        const x = p.random(30 * k, size - 30 * k);
        const amount = Math.floor(p.random(5, 12));

        for (let i = 0; i < amount; i++) {
          bubbles.push({
            x: x + p.random(-15, 15) * k,
            y: size + p.random(0, 60) * k + i * 12 * k,
            size: p.random(5, 15) * k,
            movementSpeed: p.random(0.8, 2.2) * k,
            alpha: p.random(130, 230),
            offset: p.random(1000),
          });
        }

        nextBubble = p.frameCount + Math.floor(p.random(25, 100));
      }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.y -= bubble.movementSpeed;
        bubble.x += p.sin(p.frameCount * 1.2 + bubble.offset) * 0.3 * k;

        if (bubble.y < -bubble.size) {
          bubbles.splice(i, 1);
        }
      }
    };

    const drawBubbles = () => {
      for (const bubble of bubbles) {
        p.push();
        p.noFill();
        p.stroke(77, 234, 251, bubble.alpha);
        p.strokeWeight(1.5 * k);
        p.ellipse(bubble.x, bubble.y, bubble.size, bubble.size);

        p.noStroke();
        p.fill(255, 255, 255, bubble.alpha * 0.8);
        p.ellipse(
          bubble.x - bubble.size * 0.22,
          bubble.y - bubble.size * 0.22,
          bubble.size * 0.18,
          bubble.size * 0.18,
        );
        p.pop();
      }
    };

    p.setup = () => {
      p.createCanvas(size, size);
      p.angleMode(p.DEGREES);
      p.rectMode(p.CENTER);

      cityLayer = p.createGraphics(size, size);
      cityLayer.rectMode(p.CENTER);
      drawCity(cityLayer);

      for (let i = 0; i < fishCount; i++) {
        const angle = p.random(360);
        const movementSpeed = p.random(1.8, 4.5) * k;

        fishes.push({
          x: p.random(40 * k, size - 40 * k),
          y: p.random(40 * k, size - 40 * k),
          vx: p.cos(angle) * movementSpeed * 0.5,
          vy: p.sin(angle) * movementSpeed * 0.5,
          movementSpeed,
          acceleration: p.random(0.005, 0.01) * k,
          size: p.random(8, 17) * k,
          offset: p.random(1000),
          wander: p.random(1000),
          alpha: p.random(100, 180),
          color: p.random(["#FFFFFF", "#F1E6FF", "#FFDDF5", "#DDF5FF"]),
        });
      }
    };

    p.draw = () => {
      p.background("#08121A");

      // 放大一點只是留原本的裁切邊界，讓城市塞滿畫面
      p.image(cityLayer, -70 * k, -70 * k, size + 140 * k, size + 140 * k);

      updateBubbles();
      drawBubbles();

      updateFoods();
      drawFoods();

      updateFishes();
      drawFishes();
    };

    // 餵食：滑鼠拖曳時在游標位置灑下飼料，魚群會自動找最近的飼料游過去
    p.mouseDragged = () => {
      const amount = Math.floor(p.random(1, 3));

      for (let i = 0; i < amount; i++) {
        foods.push({
          x: p.mouseX + p.random(-12, 12) * k,
          y: p.mouseY + p.random(-8, 8) * k,
          size: p.random(4, 7) * k,
          movementSpeed: p.random(0.25, 0.55) * k,
          offset: p.random(1000),
          landed: false,
        });
      }

      return false;
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Ocean_City_v2", "png", 1, 1);
      }
    };
  };
}
