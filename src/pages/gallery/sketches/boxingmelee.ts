import type p5 from "p5";

// 原稿「拳擊混戰」是 RPS 的 15 種族擴充版：15 種圖示（石頭、火、剪刀……槍）
// 在固定 1800x900 的畫布裡彈跳混戰，相剋規則是環狀的——(type2 - type1) mod 15
// 在 1~7 之間就是 type1 贏，輸家被同化。場上另有 15 顆藍色圓形障礙物，方塊撞到
// 會反彈、障礙物閃黃光。每輪打到只剩一種存活後結算：依當輪分數發名次積分，
// 總積分最低的玩家被淘汰，按 START 進下一輪，淘汰到剩一人就是總冠軍。
//
// 方塊大小（40px）、障礙物半徑（40px）、速度（5px/frame）、文字與按鈕的尺寸
// 位置都是針對 1800 寬寫死的絕對像素值，統一乘上 k = width / REFERENCE_WIDTH
// 等比例縮放。
const REFERENCE_WIDTH = 1800;

// 圖片放在 public/ 下用 same-origin 路徑載入，檔名去掉 .png 就是計分板上的
// 玩家名稱（沿用原稿 imgs.map(name => name.replace(".png", "")) 的做法）。
const NAMES = [
  "rock", "fire", "scissors", "snake", "human",
  "tree", "wolf", "sponge", "paper", "air",
  "water", "dragon", "demon", "thunder", "gun",
];
const IMG_URLS = NAMES.map((name) => `/images/gallery/boxing_melee/${name}.png`);

// 計分板上每個玩家的文字顏色，跟 NAMES 一一對應。
const COLOR_TEXT = [
  "#33D27B", "#F7FF3A", "#EE861B", "#56CC29", "#DBA500",
  "#3D9900", "#AA4E00", "#FF9797", "#EA5FE3", "#5FFBFB",
  "#2683E6", "#B53300", "#C103FF", "#D17ED2", "#CECDCD",
];

const OBSTACLE_COUNT = 15;

interface Box {
  size: number;
  p: p5.Vector;
  v: p5.Vector;
  type: number;
}

interface Obstacle {
  p: p5.Vector;
  r: number;
  blinkTimer: number;
}

interface Stat {
  idx: number;
  name: string;
  score: number;
  total: number;
  count: number;
  eliminated: boolean;
}

export function createBoxingMeleeSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const boxSize = 40 * k;
    const boxSpeed = 5 * k;
    const minDistToEdge = 40 * k;
    const minDistBetween = 80 * k;

    const images: p5.Image[] = [];
    let shapes: Box[] = [];
    const obstacles: Obstacle[] = [];
    let scores: number[] = [];
    let totalScores: number[] = [];
    let typeCount: number[] = [];
    let activePlayers: number[] = [];

    let startButton: p5.Element;
    let gameStarted = false;
    let firstStart = true;
    let gameOver = false;

    // 跟 mazeracing.ts 同一招：原稿用 position(width/2, height/2) 定位的是
    // 按鈕左上角、其實沒有真的置中，改用 left:50% + translateX(-50%) 水平置中。
    const centerElementX = (el: p5.Element, y: number) => {
      el.position(0, y);
      el.style("left", "50%");
      el.style("transform", "translateX(-50%)");
    };

    const setupButtonStyle = (btn: p5.Element) => {
      btn.style("font-size", `${20 * k}px`);
      btn.style("padding", `${8 * k}px ${16 * k}px`);
      btn.style("border", "none");
      btn.style("border-radius", `${12 * k}px`);
      btn.style("background", "#718096"); // 柔和藍灰
      btn.style("color", "white");
      btn.style("box-shadow", `0 ${4 * k}px ${6 * k}px rgba(0,0,0,0.3)`);
      btn.mouseOver(() =>
        btn.style("background", "linear-gradient(135deg, #718096, #4a5568)"),
      );
      btn.mouseOut(() =>
        btn.style("background", "linear-gradient(135deg, #a0aec0, #718096)"),
      );
    };

    const initPlayers = () => {
      activePlayers = [];
      for (let i = 0; i < NAMES.length; i++) {
        activePlayers.push(i);
      }
    };

    // 只在 setup() 呼叫一次：之後每輪都沿用同一批障礙物位置。
    const initObstacles = () => {
      for (let i = 0; i < OBSTACLE_COUNT; i++) {
        let valid = false;
        while (!valid) {
          const marginX = width * 0.15;
          const marginY = height * 0.15;
          const x = p.random(marginX, width - marginX);
          const y = p.random(marginY, height - marginY);
          const newObstacle: Obstacle = {
            p: p.createVector(x, y),
            r: 40 * k,
            blinkTimer: 0,
          };
          valid = true;
          for (const o of obstacles) {
            if (
              p.dist(x, y, o.p.x, o.p.y) <
              minDistBetween + o.r + newObstacle.r
            ) {
              valid = false;
              break;
            }
          }
          if (
            x < minDistToEdge ||
            x > width - minDistToEdge ||
            y < minDistToEdge ||
            y > height - minDistToEdge
          ) {
            valid = false;
          }
          if (valid) obstacles.push(newObstacle);
        }
      }
    };

    const initShapes = () => {
      const spawnPerPlayer = p.floor(30 / activePlayers.length);
      for (const player of activePlayers) {
        for (let j = 0; j < spawnPerPlayer; j++) {
          let valid = false;
          let pos: p5.Vector | undefined;
          while (!valid) {
            pos = p.createVector(
              p.random(minDistToEdge, width - minDistToEdge),
              p.random(minDistToEdge, height - minDistToEdge),
            );
            valid = true;
            for (const o of obstacles) {
              if (p.dist(pos.x, pos.y, o.p.x, o.p.y) < o.r + boxSize / 2) {
                valid = false;
                break;
              }
            }
          }
          // 原稿用 p5.Vector.random2D().mult(BoxSpeed)，這裡的 p5 import 是
          // type-only 拿不到靜態方法，改用等價的隨機角度單位向量。
          const angle = p.random(p.TWO_PI);
          shapes.push({
            size: boxSize,
            p: pos!,
            v: p.createVector(Math.cos(angle), Math.sin(angle)).mult(boxSpeed),
            type: player,
          });
        }
      }
    };

    const initScores = () => {
      scores = Array(NAMES.length).fill(0);
      if (totalScores.length === 0) {
        totalScores = Array(NAMES.length).fill(0);
      }
    };

    const resetGame = () => {
      shapes = [];
      scores = Array(NAMES.length).fill(0);
      initShapes(); // 重置玩家位置（每輪都重新產生玩家），障礙物保持不動
    };

    const drawObstacles = () => {
      for (const o of obstacles) {
        if (o.blinkTimer > 0) o.blinkTimer--;
        if (o.blinkTimer > 0) {
          const alpha = p.map(o.blinkTimer, 0, 20, 0, 255);
          p.fill(255, 255, 100, p.constrain(alpha, 0, 255));
        } else {
          p.fill("#449BF1");
        }
        p.noStroke();
        p.ellipse(o.p.x, o.p.y, o.r * 2);
      }
    };

    const drawShapes = () => {
      for (const shape of shapes) {
        shape.p.add(shape.v);
        const half = shape.size / 2;
        if (shape.p.x - half < 0 || shape.p.x + half > width) {
          shape.v.x *= -1;
          shape.p.x = p.constrain(shape.p.x, half, width - half);
        }
        if (shape.p.y - half < 0 || shape.p.y + half > height) {
          shape.v.y *= -1;
          shape.p.y = p.constrain(shape.p.y, half, height - half);
        }
        p.image(images[shape.type], shape.p.x, shape.p.y, shape.size, shape.size);
      }
    };

    // 環狀相剋：(type2 - type1) mod 15 在 1~7 之間就是 type1 贏。
    const judge = (type1: number, type2: number) => {
      const diff = (type2 - type1 + NAMES.length) % NAMES.length;
      return diff > 0 && diff <= 7 ? type1 : type2;
    };

    const checkCollisions = () => {
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const a = shapes[i];
          const b = shapes[j];
          const d = p.dist(a.p.x, a.p.y, b.p.x, b.p.y);
          if (d < a.size / 2 + b.size / 2) {
            const winner = judge(a.type, b.type);
            if (winner === a.type && b.type !== a.type) {
              b.type = a.type;
            } else if (winner === b.type && a.type !== b.type) {
              a.type = b.type;
            }
          }
        }
      }
    };

    const checkObstacleCollisions = () => {
      for (const shape of shapes) {
        for (const obs of obstacles) {
          const d = p.dist(shape.p.x, shape.p.y, obs.p.x, obs.p.y);
          if (d < shape.size / 2 + obs.r) {
            obs.blinkTimer = 20;
            // 原稿的 p5.Vector.sub(shape.p, obs.p) 是靜態方法，同上改用
            // copy().sub() 的等價寫法。
            const normal = shape.p.copy().sub(obs.p).normalize();
            shape.v.reflect(normal);
            shape.p.add(shape.v);
          }
        }
      }
    };

    const isWin = () => {
      if (shapes.length === 0) return false;
      return shapes.every((s) => s.type === shapes[0].type);
    };

    const updateScores = () => {
      typeCount = Array(NAMES.length).fill(0);
      for (const shape of shapes) {
        typeCount[shape.type]++;
      }
      if (shapes.length > 0 && !isWin()) {
        for (let i = 0; i < NAMES.length; i++) {
          scores[i] += typeCount[i];
        }
      }
    };

    // 輸入 arr 依總積分排序，同分並列、名次跳位（1,1,3 這種算法）。
    const calcRanks = (arr: { total: number }[]) => {
      const ranks: number[] = [];
      let rank = 1;
      let countSame = 1;
      ranks[0] = rank;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i].total === arr[i - 1].total) {
          ranks[i] = rank;
          countSame++;
        } else {
          rank += countSame;
          ranks[i] = rank;
          countSame = 1;
        }
      }
      return ranks;
    };

    const showRanking = () => {
      p.textFont("monospace");
      const allStats: Stat[] = [];
      for (let i = 0; i < NAMES.length; i++) {
        allStats.push({
          idx: i,
          name: NAMES[i],
          score: scores[i],
          total: totalScores[i],
          count: typeCount[i],
          eliminated: !activePlayers.includes(i),
        });
      }

      // 未淘汰玩家：當輪分數 > 總積分 > 編號；淘汰玩家：總積分由高到低。
      const activeStats = allStats.filter((s) => !s.eliminated);
      activeStats.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.total !== a.total) return b.total - a.total;
        return a.idx - b.idx;
      });
      const eliminatedStats = allStats.filter((s) => s.eliminated);
      eliminatedStats.sort((a, b) => b.total - a.total);
      const eliminatedRanks = calcRanks(eliminatedStats);

      const displayList: (Stat & { rank: number })[] = [];
      for (let i = 0; i < activeStats.length; i++) {
        displayList.push({ rank: i + 1, ...activeStats[i] });
      }
      const maxActiveRank = activeStats.length;
      for (let i = 0; i < eliminatedStats.length; i++) {
        displayList.push({
          rank: maxActiveRank + eliminatedRanks[i],
          ...eliminatedStats[i],
        });
      }

      p.textAlign(p.LEFT);
      p.textSize(18 * k);
      p.strokeWeight(0.2 * k);
      p.fill(255);

      const header =
        "Rank".padStart(4) + " " +
        "Name".padEnd(8) + " " +
        "Score".padStart(6) + " " +
        "Total".padStart(6) + " " +
        "Count".padStart(5);
      p.text(header, 20 * k, 30 * k);

      for (let i = 0; i < displayList.length; i++) {
        const s = displayList[i];
        p.fill(COLOR_TEXT[s.idx]);
        let line =
          String(s.rank).padStart(4) + " " +
          s.name.padEnd(8) + " " +
          (s.eliminated ? "-" : String(s.score)).padStart(6) + " " +
          String(s.total).padStart(6) + " " +
          String(s.count).padStart(5);
        if (s.eliminated) line += " (淘汰)";
        p.text(line, 20 * k, (55 + i * 20) * k);
      }
    };

    const endRound = () => {
      // 依當輪分數排名發名次積分（第一名拿「存活人數」分，遞減到 1 分）。
      const rankStats = activePlayers.map((i) => ({ idx: i, score: scores[i] }));
      rankStats.sort((a, b) => b.score - a.score);
      for (let i = 0; i < rankStats.length; i++) {
        totalScores[rankStats[i].idx] += rankStats.length - i;
      }

      // 加分後總積分最低者淘汰。
      const stats = activePlayers.map((i) => ({ idx: i, total: totalScores[i] }));
      stats.sort((a, b) => a.total - b.total);
      const lastIdx = stats[0].idx;
      activePlayers = activePlayers.filter((idx) => idx !== lastIdx);

      // 原稿在這裡直接把淘汰名單畫上畫布——draw() 下一幀就會蓋掉，所以實際上
      // 只閃一幀，照樣保留原稿行為。
      const eliminatedPlayers: { idx: number; total: number }[] = [];
      for (let i = 0; i < NAMES.length; i++) {
        if (!activePlayers.includes(i)) {
          eliminatedPlayers.push({ idx: i, total: totalScores[i] });
        }
      }
      eliminatedPlayers.sort((a, b) => a.total - b.total);
      const eliminatedRanks = calcRanks(eliminatedPlayers);

      p.textSize(24 * k);
      p.textAlign(p.LEFT);
      for (let i = 0; i < eliminatedPlayers.length; i++) {
        const e = eliminatedPlayers[i];
        p.fill(COLOR_TEXT[e.idx]);
        p.text(
          `淘汰名次 ${eliminatedRanks[i]} : ${NAMES[e.idx]} (總積分: ${e.total})`,
          50 * k,
          (200 + i * 30) * k,
        );
      }

      p.fill(COLOR_TEXT[lastIdx]);
      p.textSize(28 * k);
      p.textAlign(p.CENTER);
      p.text(`淘汰的是 ${NAMES[lastIdx]}`, width / 2, height / 2);

      if (activePlayers.length <= 1) {
        gameOver = true;
      }
      gameStarted = false;
      startButton.show();
    };

    p.preload = () => {
      for (let i = 0; i < IMG_URLS.length; i++) {
        images[i] = p.loadImage(IMG_URLS[i]);
      }
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.imageMode(p.CENTER);

      startButton = p.createButton("START");
      setupButtonStyle(startButton);
      centerElementX(startButton, height / 2);
      startButton.size(100 * k, 40 * k);
      startButton.mousePressed(() => {
        if (!gameOver) {
          resetGame();
          gameStarted = true;
          firstStart = false;
          startButton.hide();
        }
      });

      initObstacles(); // 只呼叫一次，第一次畫面就生成障礙物
      initPlayers();
      initShapes(); // 開賽前就有一場背景混戰在跑（原稿行為）
      initScores();
    };

    p.draw = () => {
      p.background("#333");
      p.strokeWeight(3 * k);

      drawObstacles();
      drawShapes();

      checkCollisions();
      checkObstacleCollisions();
      updateScores();

      if (!gameStarted && !firstStart && !gameOver) {
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(24 * k);
        p.text("Press START for next round", width / 2, height / 2 - 50 * k);
      } else if (gameOver) {
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(32 * k);
        p.text(
          "Game Over! Winner: " + NAMES[activePlayers[0]],
          width / 2,
          height / 2 - 50 * k,
        );
      } else if (firstStart && !gameStarted) {
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(24 * k);
        p.text("Press START to play", width / 2, height / 2 - 50 * k);
      }

      showRanking();

      if (gameStarted && isWin()) {
        endRound();
      }
    };

    p.keyPressed = () => {
      if (p.key === "s" || p.key === "S") {
        p.saveFrames("Boxing_Melee", "png", 1, 1);
      }
    };
  };
}
