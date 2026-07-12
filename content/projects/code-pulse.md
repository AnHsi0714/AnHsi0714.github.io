# CodePulse：資料結構與演算法視覺化教學平台

## 相關連結

網站：[code-pulse.cc](https://code-pulse.cc)

## 專案簡介

CodePulse 是一套整合互動式視覺化、程式執行追蹤與 AI 演算法辨識機制的資料結構與演算法教學平台，學習者除了能看預先做好的動畫教學，也能直接貼上自己寫的 Python 程式碼，讓系統分析並視覺化它實際的執行過程。核心設計是一套雙層視覺化機制：依演算法辨識的信心分數，在「高階語意動畫」與「通用控制流程圖」之間自動切換，同時兼顧教學的系統性與程式碼的探索彈性。前後測使用者研究顯示，這類工具在短時間操作下能顯著提升學習信心（大學組 p < 0.001、高中組 p = 0.021），但測驗分數僅呈正向趨勢、未達統計顯著——介面設計帶來的心理效益，跟可量測的學習成效之間仍有落差，這個落差也是後續值得深入研究的方向。

傳統資料結構與演算法教學長期仰賴文字敘述與靜態圖表，程式執行期間的動態特性——變數狀態變化、函式呼叫關係、資料結構操作過程——很難被直接觀察。初學者因此不容易建立正確的程式執行心智模型，在控制流程、函式呼叫與資料結構操作等概念上產生理解困難。

現有的程式視覺化工具也存在取捨：低門檻的動畫工具（如 VisuAlgo）多半只能展示預先定義好的演算法，無法分析使用者自己寫的程式碼；傳統除錯工具雖然完整，但呈現方式偏向開發者視角，對初學者負擔較重。CodePulse 試圖同時兼顧兩者的優點，在教學系統性與程式碼的探索彈性之間取得平衡。

## English Summary

CodePulse is a data-structures-and-algorithms learning platform that combines interactive visualization, execution tracing, and AI-based algorithm recognition: learners can follow pre-built animated lessons, or paste in their own Python code and have the system analyze and visualize how it actually runs. Its core design is a two-tier visualization scheme that automatically switches between a high-level semantic animation and a generic control-flow graph, depending on the recognizer's confidence score — balancing pedagogical structure with the flexibility to explore arbitrary code. A pre/post user study found that, over a short session, the tool significantly improved learners' confidence (university group p < 0.001, high-school group p = 0.021), while test scores only trended positive without reaching significance — a gap between the interface's psychological benefit and measurable learning gains that is itself a direction worth further study.

## 系統架構

前後端分離，分四層：展示層（Code Editor、Visualization Renderer、Learning Dashboard 等元件）、應用層（身份驗證、使用者管理、執行管理、分析管理、練習與進度管理）、基礎設施層（非同步任務佇列、Sandbox 隔離執行、執行追蹤引擎）、資料持久層（PostgreSQL）。另外整合 Gemini API、Cloudinary、SMTP 等外部服務支援 AI 分析、媒體與通知。

正式環境部署在 Cloudflare Pages（前端）+ GCP e2-micro 上的 Nginx 反向代理，再透過 SSH Reverse Tunnel 轉送到實驗室主機（WSL2）上的 Flask + Gunicorn、Celery、Redis、Docker Sandbox 與 PostgreSQL，並用 GitHub Actions 自動化部署。

<figure>
  <img src="/images/projects/code-pulse/system-architecture.png" alt="系統架構圖" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">系統架構圖</figcaption>
</figure>

## 教學式學習模式

以「步驟導向」呈現演算法執行流程：選定主題後同步顯示程式碼、動畫與步驟說明，並依資料結構類型切換對應的視覺化方式（陣列排序看索引交換數值，鏈結串列看指標變化）。動畫同步高亮對應的 Pseudo Code 行數，搭配「知識補充站」整合概念說明、複雜度分析、經典題型與真實世界應用。

<figure>
  <img src="/images/projects/code-pulse/linked-list-operation.png" alt="鏈結串列教學模式：插入節點逐步動畫" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">鏈結串列教學模式：插入節點逐步動畫</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/bubble-sort-operation.png" alt="Bubble Sort 教學模式視覺化" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Bubble Sort 教學模式視覺化</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/array-introduction.png" alt="知識補充站：陣列複雜度分析" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">知識補充站：陣列複雜度分析</figcaption>
</figure>

學完教學模式後接練習模式：單選、多選、程式填空與程式追蹤等題型(包含題組形式)，並採用基於 <span data-term="elo-rating">ELO Rating</span> 的能力評估機制動態調整題目難度——加入 <span data-term="k-factor">K-factor</span> 衰減與首次作答（First Blood）策略，讓重複作答不會持續拉高評分，同時保留 XP 獎勵提升學習動機。

<figure>
  <img src="/images/projects/code-pulse/practice-page.png" alt="練習模式：題目作答" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">練習模式：題目作答</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/practice-result.png" alt="測驗結果與段位評分" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">測驗結果與段位評分</figcaption>
</figure>

## 探索式學習模式：Lab 與 Playground

**Lab** 提供多個排序演算法的並排比較（Bubble / Selection / Insertion / Merge / Quick Sort），同步顯示執行時間、比較次數、移動次數等指標，讓學習者直接看出演算法之間的行為差異，而不只是背時間複雜度。

<figure>
  <img src="/images/projects/code-pulse/lab-page.png" alt="Lab 模式：多演算法並排比較" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Lab 模式：多演算法並排比較</figcaption>
</figure>

**Playground** 則是這個專題的核心難點：允許使用者提交任意 Python 程式碼，系統透過 <span data-term="ast">AST</span> 靜態分析建立<span data-term="cfg">控制流程圖（CFG）</span>，並用 `sys.settrace` 在 Docker sandbox 中動態追蹤執行事件，取得變數狀態與函式呼叫關係。

### 雙層視覺化機制

為了在「已知演算法」與「任意程式碼」之間取得平衡，系統設計了雙層視覺化：

- **Level 1（高階語意視覺化）**：辨識出標準演算法時，顯示陣列交換、指標移動等高階動畫，並對應 Pseudo Code 行數
- **Level 2（通用型流程視覺化）**：辨識信心不足或非標準實作時，退回顯示 CFG / Call Graph，保留執行細節但抽象程度較低

<figure>
  <img src="/images/projects/code-pulse/playground-page.png" alt="Playground：CFG / Call Graph 視覺化" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Playground：CFG / Call Graph 視覺化</figcaption>
</figure>

### 演算法辨識：語意嵌入模型比較

辨識流程把使用者程式碼轉成向量，與預先建立的演算法參考向量庫做 <span data-term="cosine-similarity-codepulse">cosine similarity</span> 比對。比較了 5 個候選嵌入模型（CodeBERT、GraphCodeBERT、UniXcoder、MiniLM-L6-v2、Jina-Code v2），並測試不正規化／部分正規化／完整正規化三種命名正規化策略——完整正規化會把變數名也抹掉，反而讓已知/未知案例的相似度分布更容易重疊；不正規化則容易被函式命名牽著走。部分正規化（只正規化函式名與參數名，保留函式內部變數名）在多數模型上都取得最好的平衡。

最終採用 **Jina-Code v2 + 部分正規化**：已知演算法辨識準確率 100%，且在含輔助函式的多函式案例中仍維持 100% 準確率，辨識閾值設為 0.80 作為觸發 Level 1 動畫的門檻。低於門檻或結構不符模板時，系統不勉強輸出語意動畫，改採較保守的 CFG 視覺化，並由 Gemini 負責生成程式摘要、複雜度說明與學習回饋。

## 使用者測試

採單組前後測，並用 A/B 卷交叉設計降低重複作答的記憶效應，分大學組與高中組施測，受試者操作平台 20–30 分鐘後完成後測與問卷。

| 指標                     | 大學組                       | 高中組                       |
| ------------------------ | ---------------------------- | ---------------------------- |
| 測驗分數 <span data-term="normalized-gain">Normalized Gain</span> | 0.222（p = 0.292，未達顯著） | 0.230（p = 0.214，未達顯著） |
| 學習信心提升             | p < 0.001（顯著）            | p = 0.021（顯著）            |

測驗分數呈正向但未達統計顯著，推測與操作時間較短、樣本量有限有關；但學習信心在兩組都顯著提升，顯示動態視覺化確實降低了受試者對演算法的心理負擔。

<figure>
  <img src="/images/projects/code-pulse/test-score.png" alt="前後測測驗分數比較" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">前後測測驗分數比較</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/confidence-score.png" alt="前後測學習信心比較" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">前後測學習信心比較</figcaption>
</figure>

問卷回饋中，「逐行執行動畫」是評分最高的視覺化功能（4.18 / 5），「有助理解抽象資料結構操作」緊接著（4.11 / 5）。開放式回饋則指出，平台首次使用時仍有一定操作門檻，部分功能位置不夠直覺。

## 結論與未來方向

CodePulse 證明了把靜態分析、動態追蹤、語意嵌入模型與 LLM 輔助分析整合在同一條 pipeline 裡是可行的——既能像傳統動畫工具一樣教學，又能像除錯工具一樣分析任意程式碼。比較有意思的研究發現是：演算法正規化策略的價值不在於提高準確率本身，而是在「命名干擾」與「保留語意特徵」之間找平衡點。

研究限制主要在於樣本量與測試時間有限、Playground 目前只支援 Python、尚未做大規模併發壓力測試。<br>

未來方向：

1. 擴展支援語言（C / C++ / Java / JavaScript）
2. 更細緻的 adaptive guidance 與個人化學習路徑
3. 擴充演算法參考向量庫，提升未知程式碼辨識能力
4. 擴大受試者規模與觀察時間，驗證長期學習成效
