import type p5 from "p5";

// 原稿「迷宮競速」吃固定 1800x900 的畫布，改寫成 instance mode，width/height
// 從外部傳入。這是一個完整的雙人賽跑／協力迷宮遊戲：用 createButton/createRadio
// 做選單，方向鍵操控 P1、WASD 操控 P2，比一般「生成藝術、點擊重製」複雜很多，
// 所以在 sketches/index.ts 新增了 keyboard-game 這個互動類型，而非硬塞進
// click-regenerate。存檔鍵也從其他作品慣用的 S 改成 H（S 被 P2 的「往下」占用了，
// 見 index.ts 的 saveKey 覆寫）。
//
// 原稿把方塊大小（nsize=50px）、選單元件的位置/尺寸/字級、格線位移（20px）都
// 寫死在「1800px 寬」的假設上，統一乘上 k = width / REFERENCE_WIDTH 等比例縮放；
// moveDelay（150ms）、fogVersion（可視格數倍率）這類跟時間或格數有關、不是像素
// 距離的常數則不需要縮放。
const REFERENCE_WIDTH = 1800;

interface MazeCell {
  isVisited: number;
  right1: number;
  down1: number;
}

// createRadio() 回傳的 Element 在執行期有 .option()/.selected()/.changed()，
// 但 @types/p5 目前沒有把這幾個方法宣告進 Element class（已知的型別缺口，
// .changed() 甚至只掛在 MediaElement 上），這裡另外擴充一個型別描述實際會
// 用到的方法。
type RadioElement = p5.Element & {
  option: (value: string, label?: string) => p5.Element;
  selected: (value?: string) => string;
  changed: (fxn: (...args: unknown[]) => unknown) => p5;
};

type Direction = "left" | "right" | "up" | "down";

export function createMazeRacingSketch(width: number, height: number) {
  return (p: p5) => {
    const k = width / REFERENCE_WIDTH;
    const nx = 35;
    const ny = 17;
    const nsize = 50 * k;
    const gridOffset = 20 * k;
    const finishX = nx - 1;
    const finishY = ny - 1;
    const moveDelay = 150;
    const fogVersion = 2;

    let nmap: MazeCell[][] = [];
    let player1X = 0;
    let player1Y = 0;
    let player2X = 0;
    let player2Y = 0;
    let stepcount1 = 0;
    let stepcount2 = 0;
    let finalSteps1 = 0;
    let finalSteps2 = 0;
    let finalTime = 0;
    let initialSecond = 0;
    let initialMinute = 0;
    let initialHour = 0;
    let reachTime1: number | null = null;
    let reachTime2: number | null = null;
    let lastMoveTime1 = 0;
    let lastMoveTime2 = 0;

    let startButton: p5.Element;
    let radioMenu: p5.Element;
    let r1: RadioElement;
    let r2: RadioElement;
    let r3: RadioElement;
    let gameStarted = false;
    let gameFinished = false;

    let player2Enabled = false;
    let winner = "";
    let mode = "Race Mode";
    let isFog = false;
    let fogG: p5.Graphics | undefined;

    let rndR = 0;
    let rndG = 0;
    let rndB = 0;

    const isOut = (x: number, y: number) => x < 0 || y < 0 || x >= nx || y >= ny;

    const dfs = (curx: number, cury: number) => {
      if (nmap[curx][cury].isVisited === 1) return;
      nmap[curx][cury].isVisited = 1;

      const dx = [-1, 0, 1, 0];
      const dy = [0, -1, 0, 1];
      const dirs = [0, 1, 2, 3];
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = p.int(p.random(4));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }
      for (const dir of dirs) {
        const xt = curx + dx[dir];
        const yt = cury + dy[dir];
        if (!isOut(xt, yt) && nmap[xt][yt].isVisited === 0) {
          if (dir === 0) nmap[xt][yt].right1 = 1;
          else if (dir === 1) nmap[xt][yt].down1 = 1;
          else if (dir === 2) nmap[curx][cury].right1 = 1;
          else if (dir === 3) nmap[curx][cury].down1 = 1;
          dfs(xt, yt);
        }
      }
    };

    const initial = () => {
      nmap = [];
      for (let i = 0; i < nx; i++) {
        nmap[i] = [];
        for (let j = 0; j < ny; j++) {
          nmap[i][j] = { isVisited: 0, right1: 0, down1: 0 };
        }
      }
      dfs(p.int(p.random(nx)), p.int(p.random(ny)));

      initialSecond = p.second();
      initialMinute = p.minute();
      initialHour = p.hour();
      rndR = p.random(100);
      rndG = p.random(100);
      rndB = p.random(100);
    };

    const resetGame = () => {
      player1X = 0;
      player1Y = 0;
      stepcount1 = 0;
      player2X = 0;
      player2Y = 0;
      stepcount2 = 0;
      gameFinished = false;
      finalSteps1 = 0;
      finalSteps2 = 0;
      finalTime = 0;
      winner = "";
      reachTime1 = null;
      reachTime2 = null;
      initial();
    };

    const startGame = () => {
      gameStarted = true;
      startButton.hide();
      r1.hide();
      r2.hide();
      r3.hide();
      resetGame();
    };

    // p.position(x, y) 定位的是元素的左上角，不是中心點；原稿用固定的
    // width/2、width/2-100 硬湊置中，三個 radio 群組的選項文字長度不一樣寬，
    // 用同一個左邊界並不會讓三行看起來真的置中對齊。這裡改成 left:50% +
    // transform:translateX(-50%)，不管元素實際寬度多少都能真正水平置中。
    const centerElementX = (el: p5.Element, y: number) => {
      el.position(0, y);
      el.style("left", "50%");
      el.style("transform", "translateX(-50%)");
    };

    // 三個 radio 群組（p2/mode/fog）各自的選項要對成同一個兩欄表格：第一欄
    // （No Player 2／Race Mode／No Fog）跟第二欄（Add Player 2／Co-op Mode／
    // Fog）分別在三行間垂直對齊。如果各群組各自獨立排版、自己置中，欄寬會因
    // 文字長度不同而對不齊；改成把三個群組都塞進同一個 CSS Grid 容器（見
    // setup() 裡的 menu），靠 grid-template-columns 自動抓「該欄所有列裡最寬
    // 的內容」，三行就會自然對齊，也只需要置中這一個容器就好，不用逐一置中
    // 每個群組。
    //
    // p5 createRadio 每個選項的 DOM 結構是 <label><input><span>文字</span></label>，
    // 這裡把群組自己的 <div> 設成 display:contents，讓它的 box 從版面中消失，
    // 底下的 <label> 直接變成外層 grid 的成員，同時 color/font-size 這類可繼承
    // 屬性依然會往下傳。
    const styleRadioButton = (rb: RadioElement) => {
      rb.style("display", "contents");
      rb.style("font-size", `${16 * k}px`);
      rb.style("color", "white");

      const inputs: NodeListOf<HTMLInputElement> =
        rb.elt.querySelectorAll("input[type='radio']");
      inputs.forEach((inp) => {
        inp.style.width = `${20 * k}px`;
        inp.style.height = `${20 * k}px`;
        inp.style.cursor = "pointer";
        inp.style.verticalAlign = "middle";
        inp.style.margin = `0 ${8 * k}px 0 0`;
        inp.style.accentColor = "#FFEE00";
      });
    };

    const movePlayer1 = (dir: Direction) => {
      const dx = [-1, 1, 0, 0];
      const dy = [0, 0, -1, 1];
      let tx = player1X;
      let ty = player1Y;

      if (dir === "left") {
        tx += dx[0];
        ty += dy[0];
        if (!isOut(tx, ty) && nmap[tx][ty].right1 === 1) {
          player1X = tx;
          player1Y = ty;
          stepcount1++;
        }
      }
      if (dir === "right") {
        tx += dx[1];
        ty += dy[1];
        if (!isOut(tx, ty) && nmap[player1X][player1Y].right1 === 1) {
          player1X = tx;
          player1Y = ty;
          stepcount1++;
        }
      }
      if (dir === "up") {
        tx += dx[2];
        ty += dy[2];
        if (!isOut(tx, ty) && nmap[tx][ty].down1 === 1) {
          player1X = tx;
          player1Y = ty;
          stepcount1++;
        }
      }
      if (dir === "down") {
        tx += dx[3];
        ty += dy[3];
        if (!isOut(tx, ty) && nmap[player1X][player1Y].down1 === 1) {
          player1X = tx;
          player1Y = ty;
          stepcount1++;
        }
      }
    };

    const movePlayer2 = (dir: Direction) => {
      const dx = [-1, 1, 0, 0];
      const dy = [0, 0, -1, 1];
      let tx = player2X;
      let ty = player2Y;

      if (dir === "left") {
        tx += dx[0];
        ty += dy[0];
        if (!isOut(tx, ty) && nmap[tx][ty].right1 === 1) {
          player2X = tx;
          player2Y = ty;
          stepcount2++;
        }
      }
      if (dir === "right") {
        tx += dx[1];
        ty += dy[1];
        if (!isOut(tx, ty) && nmap[player2X][player2Y].right1 === 1) {
          player2X = tx;
          player2Y = ty;
          stepcount2++;
        }
      }
      if (dir === "up") {
        tx += dx[2];
        ty += dy[2];
        if (!isOut(tx, ty) && nmap[tx][ty].down1 === 1) {
          player2X = tx;
          player2Y = ty;
          stepcount2++;
        }
      }
      if (dir === "down") {
        tx += dx[3];
        ty += dy[3];
        if (!isOut(tx, ty) && nmap[player2X][player2Y].down1 === 1) {
          player2X = tx;
          player2Y = ty;
          stepcount2++;
        }
      }
    };

    const drawmap = () => {
      p.background("#333");
      p.push();
      p.translate(gridOffset, gridOffset);
      p.strokeWeight(5 * k);
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          p.noStroke();
          p.fill(p.noise(i, j) * rndR, p.noise(i, j) * rndG, p.noise(i, j) * rndB);
          p.rect(i * nsize + 2.5 * k, j * nsize + 2.5 * k, nsize - 5 * k);

          if (i === player1X && j === player1Y) {
            p.fill("white");
            p.rect(i * nsize + 10 * k, j * nsize + 10 * k, nsize - 20 * k);
          }
          if (player2Enabled && i === player2X && j === player2Y) {
            p.fill("#5CD2EB");
            p.rect(i * nsize + 15 * k, j * nsize + 15 * k, nsize - 30 * k);
          }
          if (i === finishX && j === finishY) {
            p.fill("rgb(255,0,0)");
            p.rect(i * nsize + 10 * k, j * nsize + 10 * k, nsize - 20 * k);
          }

          p.stroke(nmap[i][j].right1 === 0 ? p.color("white") : p.color(p.noise(i, j) * 100));
          p.line(i * nsize + nsize, j * nsize, i * nsize + nsize, j * nsize + nsize);
          p.stroke(nmap[i][j].down1 === 0 ? p.color("white") : p.color(p.noise(i, j) * 100));
          p.line(i * nsize, j * nsize + nsize, i * nsize + nsize, j * nsize + nsize);

          p.stroke("white");
          if (i === 0) p.line(i * nsize, j * nsize, i * nsize, j * nsize + nsize);
          if (j === 0) p.line(i * nsize, j * nsize, i * nsize + nsize, j * nsize);
        }
      }
      p.pop();

      if (isFog) {
        const fogWidth = nx * nsize;
        const fogHeight = ny * nsize;
        if (!fogG || fogG.width !== fogWidth || fogG.height !== fogHeight) {
          fogG = p.createGraphics(fogWidth, fogHeight);
        }

        fogG.clear();
        fogG.noStroke();
        fogG.fill(0);
        fogG.rect(0, 0, fogG.width, fogG.height);

        fogG.erase();
        const diameter = fogVersion * nsize * 2;
        const cx1 = player1X * nsize + nsize / 2;
        const cy1 = player1Y * nsize + nsize / 2;
        fogG.circle(cx1, cy1, diameter);
        if (player2Enabled) {
          const cx2 = player2X * nsize + nsize / 2;
          const cy2 = player2Y * nsize + nsize / 2;
          fogG.circle(cx2, cy2, diameter);
        }
        fogG.noErase();

        p.image(fogG, gridOffset, gridOffset);
      }
    };

    const drawVictoryScreen = () => {
      p.background("#000000");
      p.textAlign(p.CENTER);
      p.textStyle(p.BOLD);
      p.fill("white");
      p.stroke("black");
      p.strokeWeight(5 * k);
      p.textSize(180 * k);
      p.text(mode, width / 2, height / 2);

      p.textStyle(p.NORMAL);
      p.textSize(32 * k);
      p.textAlign(p.LEFT);

      const minutes1 = p.int(finalTime / 60);
      const seconds1 = finalTime % 60;

      if (player2Enabled) {
        p.text(`P1 Steps: ${finalSteps1} steps`, width / 2 - 300 * k, height / 2 + 220 * k);
        p.text(`P2 Steps: ${finalSteps2} steps`, width / 2 + 100 * k, height / 2 + 220 * k);
        p.textAlign(p.CENTER);
        p.text(
          `FINISH Time: ${minutes1 < 10 ? "0" + minutes1 : minutes1} : ${seconds1 < 10 ? "0" + seconds1 : seconds1}`,
          width / 2,
          height / 2 + 270 * k,
        );
      } else {
        p.textAlign(p.CENTER);
        p.text(`Your Steps: ${finalSteps1} steps`, width / 2, height / 2 + 220 * k);
        p.text(
          `Your Time: ${minutes1 < 10 ? "0" + minutes1 : minutes1} : ${seconds1 < 10 ? "0" + seconds1 : seconds1}`,
          width / 2,
          height / 2 + 270 * k,
        );
      }

      p.textAlign(p.CENTER);
      if (mode === "Race Mode" && player2Enabled) {
        if (winner === "P1") p.text("PLAYER 1 WINS!", width / 2, height / 2 + 310 * k);
        else if (winner === "P2") p.text("PLAYER 2 WINS!", width / 2, height / 2 + 310 * k);
        else p.text("TIE!", width / 2, height / 2 - 100 * k);
      }

      p.textSize(32 * k);
      let conditionalTime = 0;
      if (mode === "Race Mode") {
        conditionalTime = isFog ? 150 : 60;
      } else if (player2Enabled) {
        conditionalTime = isFog ? 150 : 55;
      } else {
        conditionalTime = isFog ? 150 : 60;
      }
      if (finalTime < conditionalTime) {
        p.text("Great job!", width / 2, height / 2 + 350 * k);
      } else {
        p.text("Try to beat your time!", width / 2, height / 2 + 350 * k);
      }

      startButton.show();
      r1.show();
      r2.show();
      r3.show();
      // show() 會把 display 設回 "block"，蓋掉 styleRadioButton 設的
      // "contents"（讓選項脫離群組自己的 box、直接變成 radioMenu 網格成員的
      // 關鍵），所以這裡重新套一次是必要的，不只是保險。
      styleRadioButton(r1);
      styleRadioButton(r2);
      styleRadioButton(r3);

      const rndcolor = "fffd82-3a7ca5-010164-f45b69-8c1a6a".split("-").map((c) => `#${c}`);
      const roadcount = 15;

      p.push();
      p.noStroke();
      p.angleMode(p.DEGREES);
      p.blendMode(p.DARKEST);
      for (let i = -roadcount / 2; i < roadcount; i++) {
        p.push();
        const c1 = p.color(p.random(rndcolor));
        c1.setAlpha(128);
        p.fill(c1);
        p.shearX(p.int(p.random(360)));
        p.rect(
          i * (width / roadcount) + p.int(p.random(-50, 50) * k),
          0,
          p.int(p.random(20, 50) * k),
          height,
        );
        p.pop();
      }
      p.pop();

      p.push();
      p.noStroke();
      p.angleMode(p.DEGREES);
      p.blendMode(p.DARKEST);
      for (let i = 0; i < roadcount + roadcount / 2; i++) {
        p.push();
        const c1 = p.color(p.random(rndcolor));
        c1.setAlpha(128);
        p.fill(c1);
        p.shearX(p.int(p.random(360)));
        p.rect(
          i * (width / roadcount) + p.int(p.random(-50, 50) * k),
          0,
          p.int(p.random(20, 50) * k),
          height,
        );
        p.pop();
      }
      p.pop();
    };

    const checkVictory = () => {
      if (gameFinished) return;

      const curTime =
        p.hour() * 3600 +
        p.minute() * 60 +
        p.second() -
        (initialHour * 3600 + initialMinute * 60 + initialSecond);

      if (mode === "Race Mode") {
        if (player1X === finishX && player1Y === finishY && reachTime1 === null) {
          reachTime1 = curTime;
          finalSteps1 = stepcount1;
          if (player2Enabled) finalSteps2 = stepcount2;
        }
        if (
          player2Enabled &&
          player2X === finishX &&
          player2Y === finishY &&
          reachTime2 === null
        ) {
          reachTime2 = curTime;
          finalSteps1 = stepcount1;
          finalSteps2 = stepcount2;
        }

        if (reachTime1 !== null || (player2Enabled && reachTime2 !== null)) {
          gameFinished = true;

          if (!player2Enabled) {
            winner = "P1";
            finalTime = reachTime1 ?? 0;
          } else if (reachTime1 !== null && reachTime2 === null) {
            winner = "P1";
            finalTime = reachTime1;
          } else if (reachTime2 !== null && reachTime1 === null) {
            winner = "P2";
            finalTime = reachTime2;
          } else if (reachTime1 !== null && reachTime2 !== null) {
            if (reachTime1 < reachTime2) {
              winner = "P1";
              finalTime = reachTime1;
            } else if (reachTime2 < reachTime1) {
              winner = "P2";
              finalTime = reachTime2;
            } else if (finalSteps1 < finalSteps2) {
              winner = "P1";
              finalTime = reachTime1;
            } else if (finalSteps2 < finalSteps1) {
              winner = "P2";
              finalTime = reachTime2;
            } else {
              winner = "TIE";
              finalTime = reachTime1;
            }
          }

          drawVictoryScreen();
        }
      } else {
        const p1Done = player1X === finishX && player1Y === finishY;
        const p2Done = player2X === finishX && player2Y === finishY;
        if ((!player2Enabled && p1Done) || (player2Enabled && p1Done && p2Done)) {
          gameFinished = true;
          finalSteps1 = stepcount1;
          finalSteps2 = stepcount2;
          finalTime = curTime;
          winner = "ALL";
          drawVictoryScreen();
        }
      }
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.background("#000");

      p.textSize(120 * k);
      p.textAlign(p.CENTER);
      p.textStyle(p.BOLD);
      p.fill("white");
      p.stroke("black");
      p.strokeWeight(5 * k);
      p.text("PRESS START", width / 2, height / 2 - 125 * k);
      p.text("TO BEGIN", width / 2, height / 2);

      startButton = p.createButton("▶ START");
      centerElementX(startButton, height / 2 + 30 * k);
      startButton.size(140 * k, 50 * k);
      startButton.style("font-size", `${20 * k}px`);
      startButton.style("background", "#4F504F");
      startButton.style("color", "white");
      startButton.mousePressed(startGame);

      // 三個 radio 群組都塞進同一個 grid 容器，兩欄（各群組的第一/第二個選項）
      // 在三行間自動對齊，見 styleRadioButton 的說明。只要置中這個容器一次。
      radioMenu = p.createDiv();
      radioMenu.style("display", "grid");
      radioMenu.style("grid-template-columns", "max-content max-content");
      radioMenu.style("column-gap", `${40 * k}px`);
      radioMenu.style("row-gap", `${10 * k}px`);
      radioMenu.style("align-items", "center");
      centerElementX(radioMenu, height / 2 + 90 * k);

      r1 = p.createRadio("p2") as RadioElement;
      r1.parent(radioMenu);
      r1.option("No Player 2");
      r1.option("Add Player 2");
      r1.selected("No Player 2");
      r1.changed(() => {
        player2Enabled = r1.value() === "Add Player 2";
      });
      styleRadioButton(r1);

      r2 = p.createRadio("mode") as RadioElement;
      r2.parent(radioMenu);
      r2.option("Race Mode");
      r2.option("Co-op Mode");
      r2.selected("Race Mode");
      r2.changed(() => {
        mode = r2.value() as string;
      });
      styleRadioButton(r2);

      r3 = p.createRadio("fog") as RadioElement;
      r3.parent(radioMenu);
      r3.option("No Fog");
      r3.option("Fog");
      r3.selected("No Fog");
      r3.changed(() => {
        isFog = r3.value() === "Fog";
      });
      styleRadioButton(r3);
    };

    p.draw = () => {
      if (!gameStarted || gameFinished) return;

      const now = p.millis();

      // P1（方向鍵）
      if (now - lastMoveTime1 > moveDelay) {
        if (p.keyIsDown(p.LEFT_ARROW)) {
          movePlayer1("left");
          lastMoveTime1 = now;
        }
        if (p.keyIsDown(p.RIGHT_ARROW)) {
          movePlayer1("right");
          lastMoveTime1 = now;
        }
        if (p.keyIsDown(p.UP_ARROW)) {
          movePlayer1("up");
          lastMoveTime1 = now;
        }
        if (p.keyIsDown(p.DOWN_ARROW)) {
          movePlayer1("down");
          lastMoveTime1 = now;
        }
      }

      // P2（WASD）
      if (player2Enabled && now - lastMoveTime2 > moveDelay) {
        if (p.keyIsDown(65)) {
          movePlayer2("left");
          lastMoveTime2 = now;
        }
        if (p.keyIsDown(68)) {
          movePlayer2("right");
          lastMoveTime2 = now;
        }
        if (p.keyIsDown(87)) {
          movePlayer2("up");
          lastMoveTime2 = now;
        }
        if (p.keyIsDown(83)) {
          movePlayer2("down");
          lastMoveTime2 = now;
        }
      }

      drawmap();
      checkVictory();
    };

    p.keyPressed = () => {
      if (p.key === "h" || p.key === "H") {
        p.saveFrames("Maze_Racing_v2", "png", 1, 1);
      }
    };
  };
}
