---
type: journal
title: 從 CodePulse 認識「好設計」
date: 2026-08-08
categories: [雜記, HCI]
excerpt: 用 affordance、signifiers、feedback、mapping、discoverability 五個好設計元素，回頭檢視畢業專題 CodePulse 的介面設計。
nextSlug: ai-interaction-five-principles
---

> 撰寫期間：2026-08-08

這篇是〈[探索 HCI：從「好不好用」到「為什麼」](/articles/exploring-hci)〉的延伸，記錄我看了一系列人機互動概論的介紹影片[^1]後，對「什麼是好設計」的理解，以及回頭用這些概念檢視 CodePulse 介面設計的過程。

## Affordance

物體的實際性質或所處環境條件，讓使用者自然且直覺地了解如何使用，更準確地說，是物體與環境所承載的特質如何被使用者感知與理解。

以影片中的例子來說：平面具有支撐的 affordance，使用者看到椅子時，自然知道要坐在椅面上；電腦桌面上的資源回收筒也是一樣，使用者把檔案拖到回收筒，就像現實中把東西丟進垃圾桶。

在數位介面中，物理上的 affordance 不一定直接存在，因此使用者通常需要透過視覺或互動線索，也就是 signifiers，來理解一個元件可以進行哪些操作。

## Signifiers

向使用者傳達「物體的哪個部分」能執行「哪些操作」。

例如鍵盤上同時標示注音和字母，讓使用者知道按下去會輸入哪個符號；按鍵形狀也是一種訊號：打字鍵是小正方形，特殊功能鍵則比較長；此外主鍵盤區、特殊功能鍵區、數字區的配置，也讓使用者在面對沒有標示的鍵盤時，依然能大致猜出功能。

另一個例子是門把：凸出來的把手會讓人本能地用拉的，平面的把手則暗示要用推的。

網站也是如此：可互動元件常透過 hover 時的顏色、形狀或游標變化，向使用者提示「這裡可以互動」。

第一次進入 CodePulse 關卡時會有導覽提醒使用者如何操作（圖一）；按鈕也會用 cursor 的 pointer 屬性表示可點擊。

<figure>
  <img src="/images/articles/code-pulse-good-design/codepulse-guide-tour.png" alt="CodePulse 平台在使用者第一次進入關卡時顯示的操作導覽提示框" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">圖一：首次進入關卡時出現的導覽提示，說明可以用按鈕切換左右版面配置</figcaption>
</figure>

## Feedback

讓使用者知道裝置正依照需求運作。回饋必須在操作後立即給予，並正確傳達行為的結果。

例如自動門會閃 LED 燈或發出叮咚聲，公車下車鈴也有聲音與燈光提示。

CodePulse 辨識演算法執行時會顯示 loading 文字，讓使用者知道系統正在運作（圖二）。如果沒有這個回饋，使用者可能無法判斷系統是在運算、沒有反應，還是發生錯誤。

<figure>
  <img src="/images/articles/code-pulse-good-design/codepulse-loading-state.png" alt="CodePulse 平台在分析程式碼時顯示「Waiting for analysis...」的等待狀態畫面" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">圖二：送出程式碼後，畫面會顯示等待分析中的狀態，讓使用者知道系統正在處理</figcaption>
</figure>

## Mapping

將裝置的運作方式、使用者的操作與裝置產生的效果連結在一起。

例如自動筆是從上往下按壓，筆芯也從上往下伸出，兩者方向一致，有助於使用者理解與記憶；電燈開關也是同樣道理，往上撥有「增強、加大」的意涵，往下撥則是「減弱、縮小」，剛好呼應燈光的明滅，這就是意義上的相似性所形成的 mapping。反例則是常見的電燈開關面板，開關的位置經常和實際對應的燈具位置對不上，就是缺乏 mapping 的例子。

目前重新檢視 CodePulse 後，我仍沒有找到一個足夠明確的 mapping 案例。這也讓我開始意識到，不是每個 HCI 概念都能直接套用到所有介面上；比起為了湊齊分類而硬找例子，如何判斷一個概念是否真的適用，可能更值得思考。

## Discoverability

當 affordance、signifier、mapping、feedback 都做得夠好時，使用者才能真正「發現」有哪些操作可用。它是這四者共同作用的結果，而不是獨立的第五個元素。

> 一個好設計往往同時具備多個好元素；一個不好的設計往往同時缺乏多個好元素。

整體而言，CodePulse 大多數操作都能被使用者自然發現，但這樣就算是一個好設計了嗎？

重新檢視後我發現，CodePulse 裡的動畫教學設定上是可以自由觀看，不需要照順序解鎖，但測驗關卡卻需要依序過關才能開啟。因為兩者被放在同一種節點樣式裡呈現，動畫關卡在視覺上也長得像被鎖住的關卡，使用者容易誤以為要先破關才能看動畫。這其實同時踩到兩個問題：一是 signifier 傳達了錯誤訊息（鎖頭樣式暗示「不可互動」，但實際上可以互動）；二是視覺呈現的關卡狀態與實際互動規則沒有一致對應，使用者建立的心智模型因此是錯的。

<figure>
  <img src="/images/articles/code-pulse-good-design/lock.png" alt="CodePulse 學習路徑節點圖，Stack、Queue、Linked List 因測驗尚未解鎖而顯示鎖頭圖示，只有 Array 顯示可播放的圖示" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">圖三：鎖頭圖示代表的是測驗關卡尚未解鎖（設計上以測驗進度為主），但同一個節點底下的動畫教學其實不受此限制、仍可自由觀看，這點卻不容易被使用者發現</figcaption>
</figure>

使用者看到鎖頭後，很自然地建立「必須依序解鎖」的心智模型；但實際互動卻不需要這項限制。當 signifier 傳達的資訊與系統實際行為不一致時，即使功能本身沒有問題，也可能造成使用者理解上的障礙。

至於 mapping，這個案例是否適合歸入 mapping，我目前仍不確定。比較明確的是，介面呈現出的狀態與實際互動規則不一致，進而造成使用者建立錯誤的 mental model。

這次重新檢視 CodePulse，也讓我發現，HCI 並不是替介面問題貼上幾個名詞，而是提供一種分析問題的方式。以前我可能只會說「這個設計容易讓人誤會」，現在則可以進一步追問：是哪一個 signifier 造成了什麼樣的認知？使用者因此建立了什麼 mental model？而這個模型又與實際系統行為有何落差？

[^1]: [人機互動概論：探索人與科技交會的新思維](https://www.youtube.com/watch?v=pR-kh31zIUo&list=PLQn99bzkJv9xK8KR9foKdNC3dLyL77u3Y)〈課程簡介〉
