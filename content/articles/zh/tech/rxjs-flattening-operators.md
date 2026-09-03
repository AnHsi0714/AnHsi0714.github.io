---
type: tech
title: RxJS 操作符該怎麼選：從問題直接查答案的對照表
date: 2026-09-02
categories: [筆記, Web, 技術]
excerpt: 從實習寫 Angular 的經驗整理 RxJS 常用的 operator：攤平巢狀 Observable 該選哪個、資料要怎麼轉換和過濾、錯誤要怎麼處理、什麼時候只訂閱一次，整理成一張可以直接查的對照表。
---

> 撰寫期間：2026-09-02

## 前情提要

在太陽鳥軟體實習做 Angular 前端開發時，專案裡大量用 <span data-term="rxjs">RxJS</span> 處理非同步事件與 API 請求。一開始我常看到 <span data-term="concat-map">concatMap</span>、<span data-term="switch-map">switchMap</span>、<span data-term="merge-map">mergeMap</span>、<span data-term="exhaust-map">exhaustMap</span> 這幾個 operator 交替出現，卻分不清楚該在什麼情境選哪一個，甚至一度以為它們只是「同一件事的不同寫法」。後來才發現，這幾個 operator 解決的其實是同一類問題的不同策略，選錯了會直接造成 <span data-term="race-condition">race condition</span> 或使用者體驗上的 bug。

## 問題本身：為什麼需要「攤平」

當一個使用者的動作（點擊、輸入）會觸發一個新的 Observable（通常是一個 API 請求）時，如果這個動作可能被重複觸發，就會產生「外層 Observable 裡面還有內層 Observable」的巢狀結構。這幾個 operator 都是在做同一件事：把巢狀的 Observable 攤平成一層，差別在於攤平的策略不同。

## mergeMap：全部並行，互不影響

<span data-term="merge-map">mergeMap</span> 讓每次觸發都各自獨立送出請求，並行處理，結果依照各自完成的時間陸續回傳，不會取消前一次的請求。

適合「每次觸發之間彼此獨立、沒有先後關係」的情境，例如同時對多筆資料各自送出一個不需要保證順序的請求。缺點是如果使用者短時間內觸發多次，舊的請求不會被取消，回應可能會亂序回來，畫面顯示的結果不一定是最新一次操作的結果。

```ts
deleteClicks$
  .pipe(mergeMap((itemId) => deleteItem(itemId)))
  .subscribe((itemId) => removeFromList(itemId));
```

使用者連續點擊「刪除 A」「刪除 B」「刪除 C」→ 三個刪除請求同時送出，誰先回來就先把誰從畫面上移除，不需要排隊等待。

## concatMap：排隊，保證順序

<span data-term="concat-map">concatMap</span> 會把每次觸發的內層 Observable 排隊，等前一個完成後才開始下一個，確保處理順序跟觸發順序一致。

適合「順序不能亂」的情境，例如依序送出多筆表單資料、或需要保證前一步驟成功後才能執行下一步的操作。代價是如果某一次觸發卡住或很慢，後面的都要等，使用者可能會感覺卡頓。

```ts
checkoutSteps$
  .pipe(concatMap((step) => submitStep(step)))
  .subscribe((result) => updateCheckoutStatus(result));
```

依序送出 `'create-order'` → `'charge'` → `'notify-shipping'`：一定照這個順序完成，即使「扣款」比較慢，「出貨通知」也會等它做完才開始，不會提早發生。

## switchMap：只留最新的一次，取消前一個

<span data-term="switch-map">switchMap</span> 一旦有新的觸發，會直接取消前一個還沒完成的內層 Observable，只保留最新一次的結果。

適合「只在乎最新結果、舊的可以直接丟掉」的情境，這也是為什麼它是處理搜尋框、篩選這類「使用者操作會不斷取代前一次意圖」的場景最常見的選擇：使用者打字打到第五個字時，前四次的搜尋請求都已經沒有意義了，直接取消最合理。

```ts
searchInput$
  .pipe(switchMap((keyword) => searchApi(keyword)))
  .subscribe((results) => showResults(results));
```

使用者依序輸入 `'r'` → `'re'` → `'react'`：畫面最後只會顯示 `'react'` 的搜尋結果，前兩次還沒回來的請求直接被取消，不會出現「`'re'` 的結果比 `'react'` 還晚回來、蓋掉正確答案」的情況。

## exhaustMap：正在執行時，忽略新的觸發

<span data-term="exhaust-map">exhaustMap</span> 遇到新的觸發時，如果前一個內層 Observable 還沒完成，直接忽略這次新的觸發，等目前這個結束後，才會再接受下一次。跟 <span data-term="switch-map">switchMap</span> 剛好相反：switchMap 是新的蓋過舊的，exhaustMap 是舊的還在跑就不理新的。

適合「正在執行時，不希望被新的觸發打斷或重複觸發」的情境，例如使用者按下送出按鈕後，在請求還沒回來之前，即使又按了一次也不該送出第二個請求，避免重複送出表單或重複扣款。

```ts
submitClick$
  .pipe(exhaustMap(() => submitOrder(orderPayload)))
  .subscribe((result) => showConfirmation(result));
```

使用者在第一次送出訂單的請求還沒回來前又點了一次「送出」：第二次點擊直接被忽略，畫面上只會出現一筆訂單，等第一個請求完成後，下一次點擊才會生效。

四個範例的程式碼骨架其實一樣，都是「來源 Observable → pipe 一個攤平 operator → subscribe 處理結果」，真正決定行為的是中間選了哪個 operator，以及它怎麼對待重複觸發時那個還沒結束的舊請求。

## 四者的關係

| Operator   | 遇到新的內層 Observable 時 | 適合情境                     |
| ---------- | -------------------------- | ---------------------------- |
| mergeMap   | 並行處理，互不影響         | 觸發之間彼此獨立、順序不重要 |
| concatMap  | 排隊等前一個完成           | 順序必須保留                 |
| switchMap  | 取消前一個，只留最新       | 只在乎最新結果               |
| exhaustMap | 忽略新的，直到前一個完成   | 執行中不該被新觸發打斷       |

## debounceTime：解決的是另一個問題

<span data-term="debounce-time">debounceTime</span> 常常跟 <span data-term="switch-map">switchMap</span> 一起出現（`debounceTime(300), switchMap(...)`），但它解決的其實是不同層次的問題：debounceTime 管的是「多久沒有新事件才觸發下一步」，決定要不要送出這次觸發；switchMap 管的是「送出去之後，遇到新的觸發要怎麼處理舊的那個」。前者是節流輸入事件本身，後者是攤平巢狀 Observable 的策略，兩者可以疊加，但各自處理不同問題。

也因為常常一起出現，debounceTime 容易被誤會成是 switchMap 系列 operator 的一種，但它其實跟 <span data-term="concat-map">concatMap</span>／switchMap／<span data-term="merge-map">mergeMap</span> 不是同一類東西：前者控制觸發頻率，後者決定攤平策略。

```ts
searchInput$
  .pipe(
    debounceTime(300),
    switchMap((keyword) => searchApi(keyword)),
  )
  .subscribe((results) => showResults(results));
```

## 常用 operator 快速對照

除了攤平策略，寫 <span data-term="rxjs">RxJS</span> 時還會頻繁用到幾個 operator，各自負責不同的事：<span data-term="map">map</span> 轉換資料、<span data-term="filter">filter</span> 過濾、<span data-term="tap">tap</span> 側錄 side effect、<span data-term="distinct-until-changed">distinctUntilChanged</span> 濾掉重複值、<span data-term="catch-error">catchError</span> 攔截錯誤、<span data-term="retry">retry</span> 自動重試、<span data-term="fork-join">forkJoin</span> 等多個來源都完成、<span data-term="take-one">take(1)</span> 只訂閱一次、<span data-term="take-until">takeUntil</span> 訂閱到某個事件發生就停止。這幾個沒有攤平策略那麼容易搞混，但寫熟悉之前很容易忘記語法或使用時機，整理成一張表方便直接查。

下面每一列的「範例」都用同一種情境示範：`users$` 是一個會送出使用者物件（例如 `{ id: 1, name: 'Tom', active: true }`）的 Observable，格式統一寫成「輸入 → operator → 輸出」，方便直接看出這個 operator 實際上把資料變成什麼樣子，而不是只看語法。

| Operator             | 做什麼                                                       | 什麼時候用                                           | 範例                                                                                                                    |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| map                  | 把每個值轉換成新的值，一對一映射                             | API 回來的資料要轉成畫面需要的格式                   | `{ id: 1, name: 'Tom' }` → `map(u => u.name)` → `'Tom'`                                                                 |
| filter               | 只放行符合條件的值                                           | 只想要串流裡符合某個條件的資料                       | `{ active: true }` → `filter(u => u.active)` → 留下；`{ active: false }` → 丟掉                                         |
| tap                  | 不改變資料，只是在中間做一次 side effect（例如 log）         | 想在資料流過的路上記錄或除錯，但不想影響資料本身     | `'Tom'` → `tap(u => console.log(u))` → `'Tom'`（值不變，主控台多印一行）                                                |
| distinctUntilChanged | 跟前一個值相同就不繼續往下傳                                 | 避免同一個值重複觸發後續邏輯                         | `'vue'` → `'vue'` → `'react'` → `distinctUntilChanged()` → `'vue'` → `'react'`（重複的第二個 `'vue'` 被濾掉）           |
| catchError           | 攔截錯誤，換成一個新的 Observable，讓串流不會直接中斷        | API 請求失敗時不想讓整條串流死掉，想接住錯誤繼續運作 | 拋出 500 錯誤 → `catchError(() => of([]))` → `[]`（串流不中斷，改吐出預設值）                                           |
| retry                | 發生錯誤時自動重新訂閱原本的 Observable，重試幾次            | 網路請求偶爾失敗，想在真的顯示錯誤前先自動重試       | 第 1 次失敗 → `retry(2)` → 自動重送，最多 2 次，直到成功或放棄                                                          |
| forkJoin             | 等所有傳入的 Observable 都完成，一次拿到全部的最終結果       | 需要同時打好幾支 API，等全部回來才能顯示畫面         | `getUser()` 成功、`getOrders()` 失敗 → `forkJoin([...])` → 整個失敗，`getUser()` 已經成功的結果也一起被丟掉（詳見下方） |
| take(1)              | 只取第一個值，拿到後自動取消訂閱                             | 只需要訂閱一次的資料，不需要持續監聽                 | `'dark'` → `'light'` → `take(1)` → 只拿到 `'dark'`，之後自動取消訂閱                                                    |
| takeUntil            | 持續訂閱，直到另一個 Observable 發出值為止，之後自動取消訂閱 | 元件銷毀時要取消所有訂閱                             | 滑鼠持續移動送出座標 → `takeUntil(destroy$)` → 元件銷毀後不再送出新值                                                   |

forkJoin 多補充一點：一開始寫的時候直接把好幾支 API 包進同一個 forkJoin，同時打出去、等全部回來再一次渲染畫面，直覺上沒有問題。後來 code review 被提醒：forkJoin 只要其中一個來源出錯，會立刻整個失敗，就算其他來源已經成功回應，那些結果也會被一起丟掉，畫面什麼都沒有。後來改成每支 API 各自用 catchError 接住自己的錯誤、給一個預設值，讓 forkJoin 本身一定會成功完成，頂多某個欄位顯示預設值，而不是整頁掛掉：

```ts
forkJoin([
  getUser().pipe(catchError(() => of(null))),
  getOrders().pipe(catchError(() => of([]))),
]).subscribe(([user, orders]) => renderPage(user, orders));
```

## 結論

選哪個 operator，取決於「這個動作被重複觸發時，你希望怎麼對待舊的那一次」：不在乎就用 <span data-term="merge-map">mergeMap</span>，要保順序就用 <span data-term="concat-map">concatMap</span>，只要最新的就用 <span data-term="switch-map">switchMap</span>，執行中不想被打斷就用 <span data-term="exhaust-map">exhaustMap</span>。<span data-term="debounce-time">debounceTime</span> 則是在更前面一層，先決定要不要讓這次觸發真的送出去。轉換、過濾、錯誤處理、訂閱控制這些更基本的 operator，則是每天都會用到、但也最容易忘記語法的部分，遇到問題時只要查表就行。
