# 基於雙軌 NLP 技術之使用者回饋自動化分析語義模型

## 研究背景與動機

這個研究針對 [CodePulse](https://code-pulse.cc/) 平台的使用者回饋問卷，分別用規則式（Rule-Based）NLP pipeline 與 Gemini Zero-Shot 兩種方法做細粒度情感分析（Aspect-Based Sentiment Analysis, ABSA），把「動畫很流暢，但測驗送出會卡頓」這類自由文字拆解成「(動畫, 動畫演示, 流暢, 正向)、(測驗送出, 測驗系統, 卡頓, 負向)」這樣可操作的四元組。相較於只能判斷整句好壞的傳統情感分析，ABSA 能精確指出「哪個功能被如何評價」，讓開發團隊可以直接對應到具體要改進的地方。在同一份人工標註的 Ground Truth 上，Gemini Zero-Shot 的完整四元組抽取 Partial F1 全面勝過規則式方法（+0.207），差距主要來自隱含（implicit）屬性的補全能力；但規則式方法仍保有零 API 成本、可解釋性高、能在隱私敏感場景本地執行的優勢，兩者互補而非單純被取代。

問卷回饋是自由文字，難以系統性分析：哪個功能最需要改進？使用者真正在意什麼？哪個面向有具體問題？

## English Summary

This project analyzes user feedback from the CodePulse platform using two parallel pipelines — a rule-based NLP pipeline and a Gemini zero-shot pipeline — for Aspect-Based Sentiment Analysis (ABSA), turning free-text feedback like "the animation is smooth, but submitting a quiz lags" into actionable quadruplets such as (animation, ANIMATION, smooth, positive) and (submitting a quiz, QUIZ, lags, negative). Unlike traditional sentiment analysis, which only judges a whole sentence as positive or negative, ABSA pinpoints exactly which feature is being praised or criticized, letting the development team map feedback directly to concrete fixes. On the same hand-annotated ground truth, the Gemini zero-shot pipeline outperforms the rule-based pipeline on full-quadruplet extraction (Partial F1, +0.207), mostly by recovering implicit aspects the rules miss; the rule-based pipeline still has its own advantages — zero API cost, high interpretability, and the ability to run locally in privacy-sensitive settings — so the two approaches complement rather than replace each other.

## 研究問題

1. 回饋文字屬於哪個面向（Aspect）？
2. 使用者對各面向的情感是正面還是負面？
3. 不同方法的分析品質差距有多大？

> 輸入：「動畫很流暢，但測驗送出會卡頓」<br>
> 輸出：(動畫, ANIMATION, 流暢, pos)、(測驗送出, QUIZ, 卡頓, neg)

## 資料集

- 來源：Google 表單問卷（CodePulse 使用者）約 55 筆
- 欄位結構：正面回饋欄 + 改進建議欄（各一欄自由文字）
- 前處理：合併兩欄、逗號切子句、過濾「無」「沒有」「n/a」等無效回覆
- 有效資料：50 rows × 2 欄 = 100 sentences

六大面向（由平台功能模組決定，非資料驅動）：

| Key          | 中文標籤   | 代表性種子詞                         |
| ------------ | ---------- | ------------------------------------ |
| UI_UX        | 介面與體驗 | 介面、畫面、按鈕、操作、觀感、設計   |
| ANIMATION    | 動畫演示   | 動畫、演示、逐步、視覺化、播放       |
| CONTENT      | 教學內容   | 程式碼、時間複雜度、教學、講解、翻譯 |
| QUIZ         | 測驗系統   | 測驗、題目、解析、詳解、作答         |
| PERFORMANCE  | 系統效能   | 提交、紀錄、延遲、卡頓、失敗         |
| GAMIFICATION | 遊戲化互動 | 沙箱、遊戲、彩蛋、打地鼠、挑戰       |

## 什麼是 ABSA

傳統情感分析停留在「句子級別」，只能籠統判斷一則留言是好是壞，容易遺漏細節。Aspect-Based Sentiment Analysis（ABSA）是細粒度（fine-grained）分析，能精確錨定使用者到底是針對「哪個具體屬性」表達滿意或抱怨。

例如「餐點很好吃，但出餐有夠慢」：

- 傳統分析：綜合判定為「中性」→ 老闆以為客人沒意見
- ABSA：【食物口味，很好吃】→ 正向；【服務效率，有夠慢】→ 負向

完整的 ABSA Quadruplet 由四個元素組成：

1. **Aspect Term** 屬性詞：被評論的具體名詞（如螢幕解析度）
2. **Aspect Category** 屬性類別：把屬性詞正規化到預先定義的六大面向
3. **Opinion Term** 意見詞：帶有主觀評價的形容詞/動詞短語（如很清晰）
4. **Sentiment Polarity** 情感極性：該屬性的正負向判斷

## 實驗 A — Rule-Based ABSA Quadruplet Pipeline

用五個階段的規則式流程，從零組裝出完整的 ABSA Quadruplet：

1. 以標點與轉折連詞對複合句做子句切割，確保語意單元獨立
2. <span data-term="ckip">CKIP</span>（BERT-base）詞性標注，合併相鄰名詞（Na/Nb/Nv）為複合 Aspect Term，保留狀態動詞（VH/VJ/VK）為 Opinion Term 候選
3. <span data-term="stanza">Stanza</span> 依存句法（nsubj / amod）配對 (Aspect, Opinion)，依存關係不足時退為子句邊界 fallback，並附加否定詞極性提示
4. SBERT（多語言語意向量）對 Aspect Term 與人工定義的種子詞錨點做 <span data-term="cosine-similarity-absa">cosine similarity</span>，歸類為六大核心主題
5. 優先採用否定詞極性提示，否則用 <span data-term="distilbert">DistilBERT</span> 對 Opinion Term 做情感分類

| 模型                                  | 用途                                             | Stage   |
| ------------------------------------- | ------------------------------------------------ | ------- |
| CKIP（bert-base-chinese）             | 中文斷詞 + POS 標注                              | 1, 3, 4 |
| Stanza（zh-hant）                     | 依存句法分析（nsubj / amod / advmod）            | 4       |
| MiniLM（paraphrase-multilingual-L12） | 語意 Embedding，aspect context → category anchor | 2       |
| DistilBERT（lxyuan multilingual）     | 情感分類（pos/neg）                              | 5       |

### 為什麼放棄純 Clustering

一開始嘗試用 <span data-term="agglomerative-clustering">Agglomerative Clustering</span> 做面向分群，但傳統分群只看數學幾何距離、不管業務邏輯，容易讓語意邊界模糊（例如 UI 和動畫的相似度只差 0.007）。改用 Anchor-Guided 分類後，靠人工給定的種子詞在向量空間中打下明確的語意地標，同時保有高可解釋性，不需要再用 Silhouette 分數去猜「最佳分群數」。

### 從 ACSA 到 ABSA Quadruplet

初版只做到 (category, sentiment) 的 ACSA，缺少 span 定位，無法回答「是哪個詞讓使用者不滿意」。升級為 (aspect_term, aspect_category, opinion_term, polarity) 後，才能提供可操作的細粒度改善建議——從「動畫情感正面」變成「動畫（ANIMATION）因為流暢（pos）」。

### 各 Stage 最終結果

| Stage | 任務                     | 方案                             | Partial F1         |
| ----- | ------------------------ | -------------------------------- | ------------------ |
| 1     | Aspect Term Extraction   | A4（複合名詞合併＋動詞白名單）   | 0.7351             |
| 2     | Category Mapping         | Combo（種子詞擴充, thr=0.30）    | 0.5691             |
| 3     | Opinion Term Extraction  | C2+（否定前綴合併＋中性詞過濾）  | 0.8630             |
| 4     | Aspect-Opinion Pairing   | D4（依存樹 + 子句邊界 fallback） | 0.6111             |
| 5     | Sentiment Classification | F3                               | 0.9000（accuracy） |
| E2E   | True Quardruplet         | 全流程                           | Quad F1=0.3459     |

Stage 3（Opinion）最容易優化；Stage 4（Pairing）天花板最低，主要卡在 implicit aspect/opinion 與跨子句語意——這些是規則式方法的結構性上限，也是後面接上 Track B 的動機。

## 實驗 B — LLM Zero-Shot（Gemini）

Track A 的天花板：implicit aspect/opinion 約佔 GT 25%、規則無法理解跨子句語意、情感分類缺乏上下文。Track B 改用 Gemini 3.1 Flash Lite，讓 LLM 一次讀懂全句，直接輸出與 Track A 完全相同格式的四元組，做同任務的橫向對比。

Prompt 設計把六大面向定義、polarity 規則（優點 = pos；缺點/建議 = neg）、implicit 規則（無法摘取具體詞時填 "implicit"）都寫進 system prompt，並要求只回傳 JSON array。

流程：使用者回饋文字 → system prompt → Gemini API（rate_delay=6s，50 rows ≈ 5 分鐘）→ JSON 解析 + 欄位驗證 → 快取 → 與 Track A 同一套 Ground Truth 計算 Quadruplet Partial F1。

把面向定義中的種子詞補進 prompt 後，Track B 的 Category macro F1 從 0.6094 提升到 0.7881，Quad <span data-term="partial-f1">Partial F1</span> 也跟著從 0.4155 提升到 0.5352。

## 雙軌對比分析

同一套 101-tuple 手標 Ground Truth、同一套 Quadruplet Partial F1 評估：

| 指標               | Track A（Rule-Based） | Track B（Gemini） | Δ         |
| ------------------ | --------------------- | ----------------- | --------- |
| Aspect Partial F1  | 0.6256                | 0.8357            | ▲ +0.2101 |
| Opinion Partial F1 | 0.7179                | 0.7981            | ▲ +0.0802 |
| Pair Partial F1    | 0.5128                | 0.7136            | ▲ +0.2008 |
| Quad Partial F1    | 0.3282                | 0.5352            | ▲ +0.2070 |

| 維度          | Track A          | Track B                             |
| ------------- | ---------------- | ----------------------------------- |
| 需要 API      | 否（本地）       | 是（費用 + 隱私）                   |
| 推理速度      | 快（< 1 秒/筆）  | 較慢（API latency，50 筆約 344 秒） |
| 可解釋性      | 高（可逐步追蹤） | 低（黑盒）                          |
| Implicit 處理 | 規則無法補全     | LLM 語意推論可補全                  |

Gemini 在同一任務上全面勝出，主要差距來自 implicit aspect 的補全能力與更高的 aspect recall——LLM 讀的是整段語意，不會被斷詞或 POS 規則卡住。但 Track A 仍有其價值：完全白箱、零 API 成本、可在隱私敏感場景本地執行，而且五個 Stage 逐步優化的過程本身就是一次完整的 NLP pipeline 設計練習。

## 互動視覺化

把兩條 pipeline 的結果做成 D3 Force Bubble Viewer：每個面向是一個獨立的 bubble chart，泡泡大小代表詞頻、顏色代表情感（綠 = 偏正向、紅 = 偏負向），可以切換 Track A / Track B 比較同一份回饋在兩種方法下的差異。

<figure>
  <img src="/images/projects/absa-wordcloud/trackA.png" alt="Track A（Rule-Based）介面與體驗面向的 bubble chart" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Track A（Rule-Based）介面與體驗面向的 bubble chart</figcaption>
</figure>

<figure>
  <img src="/images/projects/absa-wordcloud/trackB.png" alt="Track B（Gemini）介面與體驗面向的 bubble chart" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Track B（Gemini）介面與體驗面向的 bubble chart</figcaption>
</figure>

Demo：[sengq1011.github.io/absa-wordcloud](https://sengq1011.github.io/absa-wordcloud/)

## 結論與貢獻

1. ABSA Quadruplet（term-level）比單純的 ACSA（category-level）更能精確告訴開發者「哪個詞被如何評價」
2. 採用系統性 per-stage 迭代：每個 Stage 只改一個變數，確保每一步的改善都可被解釋
3. Gemini <span data-term="zero-shot">Zero-shot</span> 在同一 Quadruplet 任務上優於 Rule-based（+0.2070 Quad F1），主要優勢在 implicit aspect 補全與 aspect recall
4. 完整實作並開源：5-Stage Rule-Based ABSA Pipeline、Gemini Zero-Shot Pipeline、101-tuple 手標 Ground Truth、per-stage 量化評估框架、D3 互動視覺化
