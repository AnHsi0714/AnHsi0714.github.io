# 兩出局一壘有人該不該跑：中職教練的跑壘決策指南

## 相關連結

整合報告入口：[all-leagues-report](https://anhsi0714.github.io/CPBL2outStealDecision/reports/all-leagues-report.html)。三個聯盟各有一組報告，下表可以直接跳到指定聯盟與球季：

| 聯盟 | 盜壘決策報告                                                                                                                                                                                                                                                                                                                                                                                          | RE24 矩陣                                                                                                                                                                                                                                                                                                                                                                                 | 勝率矩陣                                                                                              | WPA 版門檻                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| CPBL | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-steal-decision-2026.html) | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-re24-matrix-2026.html) | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-win-expectancy-matrix.html) | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/cpbl-wpa-decision-thresholds.html) |
| KBO  | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-steal-decision-2026.html)     | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-re24-matrix-2026.html)     | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-win-expectancy-matrix.html)  | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/kbo-wpa-decision-thresholds.html)  |
| MLB  | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-steal-decision-2026.html)     | [2023](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2023.html) · [2024](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2024.html) · [2025](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2025.html) · [2026](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-re24-matrix-2026.html)     | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-win-expectancy-matrix.html)  | [四季合併](https://anhsi0714.github.io/CPBL2outStealDecision/reports/mlb-wpa-decision-thresholds.html)  |

## 專案簡介

這是參加「2026 台灣棒球數據分析競賽」現場戰術分析組的專案。

我們想知道的是**什麼時候適合盜壘**：中華職棒（CPBL）第 1–8 局、兩出局、僅一壘有人時，這一跑到底值不值得？為了回答這個問題，才進一步算出盜壘要成功幾成才划算（損益兩平成功率），並看這個門檻會隨打者棒次、打者類型、局數與比分怎麼變。後來把同一套方法延伸到 KBO 與 MLB，做跨聯盟比較。

傳統的 <span data-term="re24">RE24</span> 只看盜壘發生後、當半局結束前的得分期望值，卻忽略了一件事：兩出局時盜壘失敗會形成第三出局，當事打者的打席沒打完，要留到下一局重新開始。這等於用「打序整體往後延一棒」換掉當下的出局風險，也就是<span data-term="retention-effect">保留效應</span>，這是我們想補上的核心貢獻。

## 研究方法

分析分三層：

1. **篩選情境**：從逐球資料找出第 1–8 局、兩出局、僅一壘有人的打席（第 9 局與延長賽不納入，因為那時保留效應不成立）
2. **打者決策模擬**：用每位打者個人的一壘安打、二壘安打、三壘安打、全壘打、保送觸身、出局機率，以<span data-term="monte-carlo">蒙地卡羅模擬</span>同時跑「盜壘成功」「盜壘失敗」「不跑」三條路線，每個情境重跑 2,000 次，取後續得分的平均，算出<span data-term="break-even-success-rate">損益兩平成功率</span>。盜壘失敗後下一局由誰先打要看打序，表格算不出來，所以模擬會一路跑到同一隊的下一個進攻半局結束
3. **分組比較**：依打序位置（前段 1–5 棒、後段 6–9 棒）與打者類型分組，用 <span data-term="mann-whitney-u">Mann-Whitney U 檢定</span>比較各組門檻中位數是否有顯著差異。打者類型用 <span data-term="iso">ISO</span> 代理長打力、用 BB% 代理選球力，刻意不用 <span data-term="slg">SLG</span> 與 <span data-term="obp">OBP</span>，避免兩個指標高度重疊

### 三種情況怎麼算

把同一個比賽瞬間拆成三條平行路線，各自模擬到下一個進攻半局結束，取平均期望得分。門檻的算法是：

p\* = (V不跑 − V失敗) ÷ (V成功 − V失敗)

盜壘失敗的那條路線會把打者留到下一局先打，<span data-term="retention-effect">保留效應</span>就是在這裡放進模型的。

> **計算提醒**：算盜壘成功後的剩餘得分時，起算點要是盜壘成功的那一球，而不是打席或半局開始。否則盜壘之前已經發生的得分也會被算進去，高估盜壘的效益。

<figure>
  <img src="/images/projects/cpbl-steal-decision/branches.png" width="1232" height="682" alt="三種情況怎麼算：盜壘成功 0.804、盜壘失敗 0.470、不盜壘 0.666，損益兩平成功率 58.6%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季範例：成功 0.804、失敗 0.470、不跑 0.666 分，代入公式得到損益兩平成功率 58.6%</figcaption>
</figure>

### 打者沒有被視為同一個人

每位打者都用自己的打擊結果機率模擬，打席太少的打者則用 50 打席的聯盟平均先驗平滑。所以同一個情境，不同打者算出來的門檻不一樣。

<figure>
  <img src="/images/projects/cpbl-steal-decision/personal.png" width="1232" height="422" alt="打者沒有被視為同一個人：條件式出局成本、期望出局懲罰、平滑先驗" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">報告中的個人化參數：條件式出局成本 0.544 分、期望出局懲罰 0.347 分、平滑先驗 50 PA</figcaption>
</figure>

## 研究發現

以下的圖表與數字以 **CPBL 2025 球季**為主要例子，四季合併的結果會另外標明。

四季（2023–2026）的 CPBL 資料裡，**損益兩平門檻中位數落在 54%–59%，實際成功率約 67%–70%**，高出門檻約 10 個百分點。所以問題不在「要不要跑」，而在「哪些情境該跑」。

| 球季 | 損益兩平門檻（中位數） | 實際盜壘成功率 |
| ---- | ---------------------- | -------------- |
| 2023 | 59.2%                  | 69.8%          |
| 2024 | 57.3%                  | 67.6%          |
| 2025 | 58.5%                  | 67.1%          |
| 2026 | 54.0%                  | 69.6%          |

- **棒次**：門檻低點在第 1 棒附近，純能力的高點在第 4 棒
- **<span data-term="retention-effect">保留效應</span>**：四季一致，第 8 棒最嚴重
- **打者類型**：單打率愈高門檻愈低，選球力與長打力愈高門檻愈高
- **局數**：第 4 局起，改用勝率判斷後門檻明顯下降
- **投手**：對左投跑的成功率明顯低於對右投

### 棒次與打者類型

逐棒次看，門檻最低在第 1 棒（55.0%），最高在第 4 棒（61.9%）。第 4 棒的門檻高，主要是打者自己的能力在驅動：續打常常靠自己就能多拿分，盜壘被刺反而白白放掉這個打席的價值。

分組比較的結果：

- **高單打率（接觸型）打者的門檻顯著較低**（−7.3 個百分點）。單打能不能把一壘跑者送回本壘，高度依賴跑者在哪個壘包，先偷上二壘的價值特別大
- 高長打、高選球、高 TTO 型打者的門檻顯著較高，整體打擊能力愈強，愈不該冒險盜壘
- 前段與後段棒次的差距只有 0.3 個百分點，2025 年不顯著

<figure>
  <img src="/images/projects/cpbl-steal-decision/segment.png" width="1232" height="1242" alt="逐棒次損益兩平門檻中位數長條圖與分組比較表" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季逐棒次門檻與六組分組比較（Mann-Whitney U 檢定）</figcaption>
</figure>

棒次和打者類型其實會混在一起，因為教練不是隨機排棒次，棒次也可能和近況有關，教練一般會把近況好的打者排在前面。下圖列出每個棒次中各類高組打者的占比：2025 年第 1 棒有 81% 是高單打率打者、第 4 棒只有 33%，第 4 棒則有 86% 是高長打力（ISO）打者。所以「第 1 棒門檻低、第 4 棒門檻高」有一部分是這兩棒排的人本來就不同，解讀棒次差異時要連同打者類型與近況一起看。

<figure>
  <img src="/images/projects/cpbl-steal-decision/composition.png" width="1232" height="555" alt="各棒次中高長打、高選球、高上壘率、高單打率、高 TTO 打者的占比長條圖" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季各棒次排的打者類型：第 1 棒偏高單打率，第 4 棒偏高長打與高上壘率</figcaption>
</figure>

跨四季來看，<span data-term="retention-effect">保留效應</span>的形狀很穩定：第 1–5 棒為負，第 6 棒之後翻正，第 8 棒最嚴重（+3.1～4.1 個百分點）。原因是打線被多墊了一棒，才輪得到棒頭上場。

### 各隊決策品質

用二項檢定比較各隊的實際成功率和門檻中位數，p < 0.05 才判「跑對」或「跑錯」。

2025 年六隊中，只有統一 7-ELEVEn 獅顯著跑對（79.2% 對門檻 58.9%，p = 0.005）。其他五隊只有 27–49 次嘗試，樣本太少，只能說無法判定，不能說他們跑錯。

<figure>
  <img src="/images/projects/cpbl-steal-decision/team.png" width="1232" height="652" alt="各隊決策品質評估表" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季各隊決策機會、盜壘嘗試、實際成功率、95% 信賴區間、門檻與判定</figcaption>
</figure>

### 符合門檻的跑者名單

門檻會隨下一棒是誰，從 55.0% 變到 61.9%，所以每位跑者要逐棒次和自己的成功率比。2025 年 103 位跑者中：

- 24 位不管下一棒是誰都值得跑
- 8 位要看下一棒
- 16 位任何棒次都不建議
- 55 位嘗試不到 5 次，樣本不足

<figure>
  <img src="/images/projects/cpbl-steal-decision/runner.png" width="1232" height="432" alt="符合門檻的跑者名單統計" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季跑者分類：可跑 24、視棒次 8、不建議 16、樣本不足 55</figcaption>
</figure>

### 左投還是右投

投手慣用手不會改變門檻，因為門檻是由打者決定的；它改變的是跑者能不能真的跑贏門檻。

- 2025 年對左投成功率 58.6%，對右投 69.9%，差 11.4 個百分點
- 四季合併是 62.0% 對 70.5%，差 8.5 個百分點（p < 0.001）
- 對右投跑穩穩高於門檻，對左投則只是勉強貼著門檻
- 跑者對左投幾乎沒有調整，嘗試率只比對右投低約 11%
- 個別跑者差異很大，不能一概認定左投就是壞事

2026 年起的新規則限制了牽制，牽制率確實降了（左投 4.19%、右投 4.63%，前三季是 6.0–8.0%），但成功率沒有跟著上升。目前只能說「無法證實新規則提高成功率」，所以門檻沒有調整。

<figure>
  <img src="/images/projects/cpbl-steal-decision/handedness.png" width="1232" height="452" alt="左投還是右投：對左投成功率 58.6%，對右投 69.9%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季對左投 130 成功／222 次嘗試，對右投 321 成功／459 次嘗試</figcaption>
</figure>

### 互動試算

報告裡有一個「用一筆代表情境試算」的工具。可以依球員、球隊、局數、棒次、打者類型篩出一筆決策，拖曳成功率滑桿，直接比較盜壘與不跑的期望得分，同時看到該情境的 V成功、V失敗、V不跑，以及打者的個人模型。

<figure>
  <img src="/images/projects/cpbl-steal-decision/explorer.png" width="1232" height="1252" alt="用一筆代表情境試算的互動介面" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">互動試算：篩選一筆決策、拖曳假設成功率，即時比較盜壘與不跑的期望得分</figcaption>
</figure>

### 給教練的建議

整體來說，**該不該跑，看的是打擊區上的打者，不是跑者**。第 4 棒與第 8、9 棒都是「別跑」，但理由相反：第 4 棒是捨不得這個好打席，第 8、9 棒是怕失敗後卡住打線。把結果整理成一張決策表（用 RE 版，也就是「這局與下一局得幾分」計算）：

| 打擊區上的打者 | 建議       | 原因                             |
| -------------- | ---------- | -------------------------------- |
| 第 1、2 棒     | 最該跑     | 靠單打得分，跑者要在二壘才回得來 |
| 第 3、4 棒     | 最不該跑   | 長打多，跑者在一壘也能回來       |
| 第 5–7 棒      | 看跑者本事 | 兩股力量都不明顯                 |
| 第 8、9 棒     | 不該跑     | 失敗會卡住打線                   |

使用時有幾點要注意：

- 第 4 局以後應改用勝率判準，門檻通常較低，不宜直接套用上表，棒次建議在勝率版中也不穩定
- 第 9 棒站在打擊區時別跑，但他上壘後換第 1 棒打擊時，這個跑者反而該跑
- 打者球數落後時較適合發動盜壘，滿球數時沒有明顯差別
- 對右投跑的成功率較高，對左投要逐人評估
- 第 9 局與延長賽不適用，因為保留效應不成立

## 延伸分析

### RE24 矩陣

<span data-term="re24">RE24</span> 把 24 種出局數與壘包組合，各自從該狀態算到半局結束的平均得分，顏色越深代表後面還能拿越多分。它是不含打者個人差異與保留效應的基礎門檻，整個模型都以它為基準。2025 年共有 360 場、27,699 個局面樣本。

<figure>
  <img src="/images/projects/cpbl-steal-decision/re24.png" width="1192" height="632" alt="中職 RE24 得分期望值矩陣熱力圖" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2025 球季 RE24 熱力圖：無人在壘、0 出局為 0.452 分，滿壘 0 出局為 2.010 分</figcaption>
</figure>

### 勝率增值矩陣（WE）

<span data-term="win-expectancy">勝率矩陣</span>把局數、攻守方、分差、出局數與壘包合在一起，用四季資料推回進攻方最後贏球的機率，共 1,380 場、106,621 個局面樣本。它是 WPA 版門檻要查的勝率表。

<figure>
  <img src="/images/projects/cpbl-steal-decision/we.png" width="1192" height="772" alt="中職勝率矩陣熱力圖" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">合併 2023–2026 四季的勝率矩陣，可選局數、攻守方與出局數查看各分差與壘包的勝率</figcaption>
</figure>

### WPA 版損益兩平門檻

越到比賽後段，每一分都越寶貴，所以我們原本只打算用 <span data-term="wpa">WPA</span>（勝率增值）重算第 7、8 局的門檻。做下去發現前面的局數也適合，就把範圍擴大到第 2–8 局。**第 4 局起，WPA 版門檻明顯低於 RE 版**：RE 版各局都在 54–60% 上下，WPA 版第 4、6、7、8 局的四季中位數範圍約為 36–52%、37–43%、24–27%、31–35%。

原因是同一分在晚局的份量更重。領先 1 分時，第 1–6 局的勝率是 58.5%，第 7 局 73.4%，第 8 局 77.5%，所以晚局讓半局在這時結束的代價更高，門檻自然該降。RE 判成「任何棒次都不建議」的跑者，到了晚局的 WPA 門檻下，多數都夠格跑。

比分也會影響要不要跑：落後 5–6 分以上時，盜壘嘗試率掉到 3–4%（占樣本 13.7%），不過把這些極端樣本拿掉之後，門檻中位數的變動四季都在 0.2 個百分點內。

<figure>
  <img src="/images/projects/cpbl-steal-decision/wpa-conclusion.png" width="1232" height="802" alt="WPA 版門檻與 RE 版門檻逐局比較表，以及領先落後 1 分時各局勝率" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">WPA 版與 RE 版門檻中位數逐局比較，以及同一分在各局的勝率份量</figcaption>
</figure>

下圖是各局 WPA 門檻的 95% 信賴區間（藍）與 RE 門檻中位數（橘）。第 2–8 局的 WPA 區間都沒有碰到同局的 RE 門檻，代表方向可信。第 1 局因為分母太小、比值不穩，只能當參考。

<figure>
  <img src="/images/projects/cpbl-steal-decision/wpa-ci.png" width="1232" height="1072" alt="四季逐局 WPA 門檻 95% 信賴區間圖" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">2023–2026 各季逐局 WPA 門檻的 95% 信賴區間（藍）與 RE 門檻中位數（橘）</figcaption>
</figure>

## 跨聯盟比較

同一套方法也套用到 KBO 與 MLB（2023–2026 四季）：

| 指標                | CPBL                 | KBO                              | MLB         |
| ------------------- | -------------------- | -------------------------------- | ----------- |
| 門檻中位數（RE）    | 約 58%               | 61%–64%                          | 69%–71%     |
| 逐棒次形狀          | 第 1 棒低，第 4 棒高 | 第 1 棒低，高點在第 4、5 或 8 棒 | 幾乎平坦    |
| 保留效應（第 8 棒） | +3.1～4.1pp          | +3.3～3.9pp                      | +1.8～2.4pp |

- **<span data-term="retention-effect">保留效應</span>的形狀三個聯盟一致**：早段為負、第 6 棒起翻正、第 8 棒最嚴重，強度是 CPBL ≈ KBO > MLB
- 門檻的高低隨聯盟的得分環境上升，MLB 最高
- 「第 4 棒是高點」「前後段二分沒有鑑別力」這兩個結論不是跨聯盟規律，只適用於 CPBL
- MLB 對左投的成功率（76.7%）也低於對右投（79.4%），方向跟 CPBL 一樣，但差距小很多（2.7 對 8.6 個百分點）
- 晚局的 WPA 門檻在 MLB 同樣遠低於 RE：第 6、7、8 局約 48–51%、40–43%、29–37%

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
<figure>
  <img src="/images/projects/cpbl-steal-decision/mlb-segment.png" width="1232" height="1282" alt="MLB 2025 逐棒次損益兩平門檻與分組比較" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">MLB 2025：逐棒次門檻 68.5%–70.8%，幾乎平坦</figcaption>
</figure>
<figure>
  <img src="/images/projects/cpbl-steal-decision/kbo-segment.png" width="1232" height="1282" alt="KBO 2025 逐棒次損益兩平門檻與分組比較" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
  <figcaption style="text-align: center;">KBO 2025：第 1 棒 58.4% 最低，第 8 棒 65.5% 最高</figcaption>
</figure>
</div>

## 成果與貢獻

- **提出並驗證<span data-term="retention-effect">保留效應</span>**：補上傳統 <span data-term="re24">RE24</span> 看不到的盜壘失敗代價。這個效應在 CPBL 四季、KBO、MLB 都有一致的形狀，第 8 棒最嚴重，是可以跨聯盟帶走的結論
- **找出各棒次的盜壘門檻**：低點在第 1 棒附近，第 4 棒是純能力的高點。教練不用一個固定數字處理所有棒次
- **釐清打者類型的影響**：單打型打者最適合先偷上二壘，長打與選球能力強的打者則不該輕易冒險
- **晚局改用勝率判斷**：第 4 局起 WPA 版門檻明顯低於 RE 版，過去被 RE 判成「不建議」的跑者，在晚局多數其實值得跑
- **給出具體的名單與數字**：逐隊、逐跑者、逐棒次的判定，以及對左投與右投的成功率差距，可以直接拿來當跑壘決策的參考
- **建立考慮打序的蒙地卡羅模擬**：每位打者用自己的打擊機率，盜壘失敗後一路模擬到下一局，把保留效應放進損益兩平門檻
- **整理成教練看得懂的決策表**：各棒次最該跑、最不該跑的建議，加上晚局改用勝率判準的提醒
- **留下可重複使用的報告**：三個聯盟、四個球季的互動式報告，加上一筆情境試算工具，任何人都能自己調條件看結果

## 資料來源與驗證

資料全部自行蒐集：

- **CPBL**：官網 2023–2026 四個球季的逐場逐球紀錄
- **KBO**：官網文字轉播（沒有球員 ID 與累積比分，資料可信度較低）
- **MLB**：MLB Stats API 的逐打席紀錄

盜壘不是結構化欄位，是從文字敘述解析出來的。為了確認結果可靠，我們拿真實資料對過：

- 模擬出來的 24 格 <span data-term="re24">RE24</span> 與真實統計相關係數 r = 0.992，加權平均誤差 0.033 分（MLB 為 0.997，KBO 為 0.988）
- 盜壘判讀與 CPBL 官方統計逐場逐隊對帳，2025 年成功 508/508、刺殺 242/242 完全相符，四季共 2,760 組（場次，球隊）無一不符
- 模擬次數調整後結論不變，2,000 次已經收斂

資料也有限制：實際盜壘嘗試切細後只剩幾十筆，不足以做統計檢定，所以主要結論是建立在模擬上；資料裡沒有捕手阻殺率與跑者個人速度，這兩個影響只能定性說明；2023 為五隊 300 場、2024 起為六隊 360 場，跨年比較要留意。
