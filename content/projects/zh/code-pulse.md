# CodePulse：資料結構與演算法視覺化教學平台

## 相關連結

網站：[code-pulse.cc](https://code-pulse.cc)

## 問題

傳統資料結構與演算法教學長期仰賴文字敘述與靜態圖表，程式執行期間的動態特性，例如變數狀態變化、函式呼叫關係、資料結構操作過程，很難被直接觀察。初學者因此不容易建立正確的程式執行心智模型，在控制流程、函式呼叫與資料結構操作等概念上產生理解困難。

現有的程式視覺化工具也存在取捨：低門檻的動畫工具（如 VisuAlgo）多半只能展示預先定義好的演算法，無法分析使用者自己寫的程式碼；傳統除錯工具雖然完整，但呈現方式偏向開發者視角，對初學者負擔較重。

## 研究問題

CodePulse 想解決的核心問題是：能不能讓學習者不只是看預先做好的動畫，也可以直接貼上自己寫的 Python 程式碼，由系統分析並視覺化它實際的執行過程，同時仍保留教學動畫在系統性上的優勢？

具體拆解成兩個研究問題：

1. 如何設計一套機制，在「已知演算法」與「任意程式碼」之間自動判斷，並切換成適合的視覺化方式？
2. 這樣的動態視覺化系統，是否能顯著提升學習者對資料結構與演算法的學習信心與測驗表現？

## 系統設計

### 系統架構

前後端分離，分四層：展示層（Code Editor、Visualization Renderer、Learning Dashboard 等元件）、應用層（身份驗證、使用者管理、執行管理、分析管理、練習與進度管理）、基礎設施層（非同步任務佇列、Sandbox 隔離執行、執行追蹤引擎）、資料持久層（PostgreSQL）。另外整合 Gemini API、Cloudinary、SMTP 等外部服務支援 AI 分析、媒體與通知。

正式環境部署在 Cloudflare Pages（前端）+ GCP e2-micro 上的 Nginx 反向代理，再透過 SSH Reverse Tunnel 轉送到實驗室主機（WSL2）上的 Flask + Gunicorn、Celery、Redis、Docker Sandbox 與 PostgreSQL，並用 GitHub Actions 自動化部署。

<figure>
  <img src="/images/projects/code-pulse/system-architecture.png" alt="系統架構圖" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">系統架構圖</figcaption>
</figure>

### 雙層視覺化機制

為了在「已知演算法」與「任意程式碼」之間取得平衡，Playground 透過 <span data-term="ast">AST</span> 靜態分析建立<span data-term="cfg">控制流程圖（CFG）</span>，並用 `sys.settrace` 在 Docker sandbox 中動態追蹤執行事件，取得變數狀態與函式呼叫關係，再依辨識信心分數自動切換視覺化層級：

- **Level 1（高階語意視覺化）**：辨識出標準演算法時，顯示陣列交換、指標移動等高階動畫，並對應 Pseudo Code 行數
- **Level 2（通用型流程視覺化）**：辨識信心不足或非標準實作時，退回顯示 CFG / Call Graph，保留執行細節但抽象程度較低

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/playground.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Playground：CFG / Call Graph 視覺化（操作示範）</figcaption>
</figure>

### 演算法辨識：語意嵌入模型比較

辨識流程把使用者程式碼轉成向量，與預先建立的演算法參考向量庫做 <span data-term="cosine-similarity">cosine similarity</span> 比對。比較了 5 個候選嵌入模型（CodeBERT、GraphCodeBERT、UniXcoder、MiniLM-L6-v2、Jina-Code v2），並測試不正規化／部分正規化／完整正規化三種命名正規化策略：完整正規化會把變數名也抹掉，反而讓已知/未知案例的相似度分布更容易重疊；不正規化則容易被函式命名牽著走。部分正規化（只正規化函式名與參數名，保留函式內部變數名）在多數模型上都取得最好的平衡。

最終採用 **Jina-Code v2 + 部分正規化**：已知演算法辨識準確率 100%，且在含輔助函式的多函式案例中仍維持 100% 準確率，辨識閾值設為 0.80 作為觸發 Level 1 動畫的門檻。低於門檻或結構不符模板時，系統不勉強輸出語意動畫，改採較保守的 CFG 視覺化，並由 Gemini 負責生成程式摘要、複雜度說明與學習回饋。

## 互動設計

### 教學式學習模式

以「步驟導向」呈現演算法執行流程：選定主題後同步顯示程式碼、動畫與步驟說明，並依資料結構類型切換對應的視覺化方式（陣列排序看索引交換數值，鏈結串列看指標變化）。動畫同步高亮對應的 Pseudo Code 行數，搭配「知識補充站」整合概念說明、複雜度分析、經典題型與真實世界應用。

<figure>
  <img src="/images/projects/code-pulse/bubble-sort-operation.png" alt="Bubble Sort 教學模式視覺化" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Bubble Sort 教學模式視覺化</figcaption>
</figure>

<figure>
  <video controls preload="metadata" width="1920" height="1200" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/tutorial.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">知識補充站：陣列複雜度分析（操作示範）</figcaption>
</figure>

學完教學模式後接練習模式：單選、多選、程式填空與程式追蹤等題型(包含題組形式)，並採用基於 <span data-term="elo-rating">ELO Rating</span> 的能力評估機制動態調整題目難度，並加入 <span data-term="k-factor">K-factor</span> 衰減與首次作答（First Blood）策略，讓重複作答不會持續拉高評分，同時保留 XP 獎勵提升學習動機。

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/practice.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">練習模式：題目作答（操作示範）</figcaption>
</figure>

### 探索式學習模式：Lab 與 Playground

**Lab** 提供多個排序演算法的並排比較（Bubble / Selection / Insertion / Merge / Quick Sort），同步顯示執行時間、比較次數、移動次數等指標，讓學習者直接看出演算法之間的行為差異，而不只是背時間複雜度。

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/lab.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Lab 模式：多演算法並排比較（操作示範）</figcaption>
</figure>

**Playground** 則是這個專題的核心難點：讓使用者提交任意 Python 程式碼，並即時看到程式實際執行的視覺化過程，辨識為已知演算法時顯示語意動畫，否則顯示流程圖呈現執行細節。背後的判斷機制與技術實作詳見前述「系統設計」章節。

## 使用者研究

### 研究設計

本研究採單組前後測設計，共 56 位受試者，分為高中組（三年級，已修過程式設計課程）與大學組（二年級，已修過資料結構與程式設計相關課程）。

若前測與後測使用完全相同的題目，受試者可能因為記住題目或答案而產生練習效應，因此測驗設計為 A、B 兩個版本，兩卷測量相同概念但用不同方式表達題目，例如改變數值、交換 DFS 與 BFS 的情境，或在「程式碼」與「執行結果」之間轉換題型，並確保解題步驟一致，避免受試者發現兩卷實為同一題而單靠記憶作答。受試者依組別交替使用不同版本作為前測與後測。

受試者可運用時間有限，操作平台約 20–30 分鐘後即進行後測與問卷調查。

測驗表現以 Normalized Gain 衡量：

`g = (後測分數 − 前測分數) / (滿分 − 前測分數)`

| 指標                                                              | 大學組                       | 高中組                       |
| ----------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| 測驗分數 <span data-term="normalized-gain">Normalized Gain</span> | 0.222（p = 0.292，未達顯著） | 0.230（p = 0.214，未達顯著） |
| <span data-term="learning-confidence">學習信心</span>提升         | p < 0.001（顯著）            | p = 0.021（顯著）            |

### 測驗表現

高中組與大學組的 Normalized Gain 分別為 0.230 與 0.222，皆呈正向變化，但前後測差異均未達統計顯著（高中組 p = 0.214；大學組 p = 0.292）。此結果可能受樣本數與單次操作時間有限等因素影響，目前尚不足以證實平台對測驗表現具有顯著提升效果。

<figure>
  <img src="/images/projects/code-pulse/test-score.png" alt="前後測測驗分數比較" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">前後測測驗分數比較</figcaption>
</figure>

回頭檢視受試者表現後，這可能不完全代表 CodePulse 沒有學習效果，而與題目難度與受試者先備知識有關。部分程度較高的受試者（大二生）在前測就已經能穩定答對較容易的題目；面對較難的題目，原本就會的人前後測通常都答對，不會的人前後測通常都答錯，這種天花板效應讓分數本來就沒有太多進步空間，很難反映出操作 CodePulse 後理解方式的改變。高中組則相對容易出現用猜的情形，前後測分數本身的穩定度較低，同樣會削弱分數呈現學習效果的能力。另一方面，對先備知識較不足的受試者而言，部分題目可能又超出其原本能理解的範圍，使得一次短時間的操作體驗不足以轉化成測驗表現。

### 學習信心與問卷回饋

相較之下，<span data-term="learning-confidence">學習信心</span>在兩組皆達統計顯著（大學組 p < 0.001；高中組 p = 0.021），這項信心是透過問卷中的 Likert 量表讓受試者自評得出，屬於<span data-term="self-reported-confidence">自陳信心</span>測量，顯示受試者在使用平台後，對演算法學習的信心有所提升。此結果初步顯示，動態視覺化可能有助於提升學習者對演算法概念的理解信心與學習意願。

<figure>
  <img src="/images/projects/code-pulse/confidence-score.png" alt="前後測學習信心比較" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">前後測學習信心比較</figcaption>
</figure>

問卷回饋中，「逐行執行動畫」在視覺化功能的清晰度與實用性評比拿下最高分（4.18 / 5）；複選「哪些工具對學習有幫助」時，也是最多受試者勾選的項目（37 / 56）；若只能保留一個核心功能，同樣是最多人的選擇（19 / 56，領先第二名的基礎錯誤檢測 12 / 56）。三個獨立題目指向同一個結論：逐行執行動畫是使用者心中整個平台最核心的價值。

另一方面，<span data-term="self-perceived-learning-effectiveness">「有助理解抽象資料結構操作」</span>則是在『程式理解與學習』面向評分最高的項目（4.11 / 5），這題問的是受試者主觀認為平台是否讓自己學得更好，屬於學習成效自評，跟測驗分數呈現的客觀學習成效是分開的證據。「不需指導即可快速上手」這題平均僅 3.46 / 5，是量表題裡偏低的項目，也呼應開放式回饋提到平台首次使用時仍有一定操作門檻、部分功能位置不夠直覺。

### 資訊負荷

回饋問卷也顯示，視覺化雖然能讓演算法執行過程更容易理解，但動畫、變數與其他資訊同時呈現時，使用者也可能感受到資訊過多而難以負荷。「在觀看動畫與追蹤變數時，我是否感到資訊過多而難以負荷？」的評分僅 3.14 分（非常費力為 5 分），是評價較不好的項目之一。為此新增了「只有動畫播放時才開啟虛擬碼區塊」的設定，並在播放時自動捲動到對應的變數區域，讓使用者更集中於當前的執行步驟。

### 研究限制

本研究採單組前後測設計，缺乏控制組，因此無法排除測驗熟悉度、短期學習與新奇效應等因素的干擾，測驗表現與學習信心的提升不能直接歸因於平台介入本身。受試者也不一定會照著預期的方式體驗系統，例如高中組測試時有些人會睡著、也有些人並未依範圍體驗（當初因體驗時間較短，希望聚焦於測驗題目範圍），這些因素該排除還是加以規範也是待解決的問題。後續研究可加入控制組並延長操作時間，進一步驗證平台的學習成效。

## 收穫與反思

CodePulse 證明了把靜態分析、動態追蹤、語意嵌入模型與 LLM 輔助分析整合在同一條 pipeline 裡是可行的：既能像傳統動畫工具一樣教學，又能像除錯工具一樣分析任意程式碼。比較有意思的研究發現是：演算法正規化策略的價值不在於提高準確率本身，而是在「命名干擾」與「保留語意特徵」之間找平衡點。

使用者研究也點出一個值得深思的落差：介面設計帶來的心理效益（<span data-term="learning-confidence">學習信心</span>顯著提升）跟可量測的學習成效（測驗分數僅呈正向趨勢）之間並不完全一致，這也是我後來把學習信心、<span data-term="self-reported-confidence">自陳信心</span>、<span data-term="self-perceived-learning-effectiveness">學習成效自評</span>三者拆開釐清的起點。短時間的視覺化操作似乎能有效降低學習焦慮，但要轉化成可量測的知識習得，可能還需要更長的練習時間、控制組設計或更精準的引導。

問卷還有一個意外的發現：被問到平時遇到看不懂的程式邏輯怎麼辦，超過八成的受試者都提到會「問 AI」。這跟 CodePulse 想做的事其實形成一種對照：在 AI 唾手可得、幾乎能直接給答案的環境下，還要不要花時間自己動手追蹤執行過程、建立心智模型？我目前的看法是兩者並不互斥，問 AI 能快速拿到答案，但視覺化工具能讓「為什麼是這個答案」的過程變得可見、可重複檢視，這是直接問 AI 比較難取代的部分，這個問題本身也是我想繼續往 HCI、使用者研究方向挖下去的原因之一。

除了使用者研究本身的方法限制，平台目前也只支援 Python，尚未做大規模併發壓力測試。

## 未來方向

1. 擴展支援語言（C / C++ / Java / JavaScript）
2. 更細緻的 adaptive guidance 與個人化學習路徑
3. 擴充演算法參考向量庫，提升未知程式碼辨識能力
4. 擴大受試者規模與觀察時間，驗證長期學習成效
5. 優化基礎錯誤檢測的呈現方式：問卷中這項功能的清晰度與實用性評分是所有視覺化功能裡最低的（3.95 / 5），但「若只能保留一個功能」卻是第二多人選的項目（12 / 56），顯示使用者概念上很看重這個功能，只是目前的呈現還不夠好用
