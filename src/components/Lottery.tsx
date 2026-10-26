import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "./Button";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./Lottery.module.scss";

interface Prize {
  id: number;
  name: string;
  weight: number;
}

const MAX_PRIZES = 12;
const CARD_W = 120;
const GAP = 8;
const STEP = CARD_W + GAP;
// 長條把獎項重複排很多輪：起點停在第 1 輪，終點落在倒數第 3 輪，中間就是
// 轉動時掃過的卡片。每次轉之前再把位置無動畫地搬回第 1 輪，視覺上完全一樣。
const REPEAT = 10;
const START_REP = 1;
const END_REP = REPEAT - 3;
const SPIN_MS = 4500;

let nextId = 1;
const toPrizes = (defaults: { name: string; weight: number }[]): Prize[] =>
  defaults.map((d) => ({ ...d, id: nextId++ }));

// 先依權重抽出結果，動畫只負責把長條停到那一格，不決定結果。
const pickIndex = (prizes: Prize[]) => {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    roll -= prizes[i].weight;
    if (roll < 0) return i;
  }
  return prizes.length - 1;
};

export default function Lottery() {
  const { t } = useTranslation();
  const copy = t.playground.miniWorks;
  const [prizes, setPrizes] = useState(() => toPrizes(copy.lotteryDefaults));
  const [spinning, setSpinning] = useState(false);
  const [resultId, setResultId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const scrollToEndRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const landedRef = useRef({ index: 0, jitter: 0 });
  const timerRef = useRef<number | undefined>(undefined);

  // 獎項名稱留白的不上長條，權重為 0 的上長條但抽不到。
  const shown = prizes.filter((p) => p.name.trim() !== "");
  const pickable = shown.filter((p) => p.weight > 0);
  // 百分比只算真的會被抽到的項目，名稱留白的列不參與。
  const total = pickable.reduce((sum, p) => sum + p.weight, 0);
  const canSpin = pickable.length > 0 && !spinning;

  const place = (index: number, jitter: number, animate: boolean) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const x = viewport.clientWidth / 2 - (index * STEP + CARD_W / 2) + jitter;
    track.style.transition = animate
      ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.7, 0.1, 1)`
      : "none";
    track.style.transform = `translateX(${x}px)`;
  };

  // 獎項一變動就把長條歸位、清掉上一次結果。
  useLayoutEffect(() => {
    landedRef.current = { index: 0, jitter: 0 };
    place(shown.length * START_REP, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prizes.map((p) => `${p.id}:${p.name.trim() === ""}`).join(",")]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // 新增一列後把清單捲到底，並讓新列的名稱欄取得焦點。
  useEffect(() => {
    if (!scrollToEndRef.current) return;
    scrollToEndRef.current = false;
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    list.querySelector<HTMLInputElement>("li:last-child input")?.focus();
  }, [prizes.length]);

  const spin = () => {
    if (!canSpin) return;
    const n = shown.length;
    const winner = pickable[pickIndex(pickable)];
    const winnerIdx = shown.findIndex((p) => p.id === winner.id);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setSpinning(true);
    setResultId(null);

    const { index, jitter } = landedRef.current;
    place(n * START_REP + index, jitter, false);
    trackRef.current?.getBoundingClientRect(); // 強制 reflow，讓下一次 transition 從這裡起跑

    const nextJitter = (Math.random() - 0.5) * CARD_W * 0.7;
    landedRef.current = { index: winnerIdx, jitter: nextJitter };
    const target = n * END_REP + winnerIdx;
    if (reduced) {
      place(target, nextJitter, false);
    } else {
      place(target, nextJitter, true);
    }

    timerRef.current = window.setTimeout(
      () => {
        setSpinning(false);
        setResultId(winner.id);
      },
      reduced ? 0 : SPIN_MS,
    );
  };

  const update = (id: number, patch: Partial<Prize>) =>
    setPrizes((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: number) =>
    setPrizes((list) => list.filter((p) => p.id !== id));
  const add = () => {
    scrollToEndRef.current = true;
    setPrizes((list) => [...list, { id: nextId++, name: "", weight: 10 }]);
  };
  const reset = () => setPrizes(toPrizes(copy.lotteryDefaults));

  const resultName = prizes.find((p) => p.id === resultId)?.name;

  return (
    <div className={styles.lottery}>
      <div className={styles.viewport} ref={viewportRef} aria-hidden="true">
        <div className={styles.pointer} />
        <div className={styles.track} ref={trackRef}>
          {Array.from({ length: REPEAT }, (_, rep) =>
            shown.map((p) => (
              <div
                key={`${rep}-${p.id}`}
                className={[
                  styles.card,
                  rep === END_REP && p.id === resultId ? styles.winner : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.name}
              </div>
            )),
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <Button size="lg" onClick={spin} disabled={!canSpin}>
          {spinning ? copy.lotterySpinning : copy.lotteryPlay}
        </Button>
        <p className={styles.result} aria-live="polite">
          {resultName
            ? `${copy.lotteryResult}${resultName}`
            : pickable.length === 0
              ? copy.lotteryNoValid
              : " "}
        </p>
      </div>

      <section className={styles.editor}>
        <h2 className={styles.editorHeading}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={editorOpen}
            aria-controls="lottery-editor-body"
            onClick={() => setEditorOpen((open) => !open)}
          >
            <svg
              className={[styles.chevron, editorOpen ? styles.chevronOpen : ""]
                .filter(Boolean)
                .join(" ")}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                d="M5 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {copy.lotteryEditTitle}
            <span className={styles.count}>{prizes.length}</span>
          </button>
        </h2>
        <div id="lottery-editor-body" className={styles.body} hidden={!editorOpen}>
        <ul className={styles.list} ref={listRef}>
          {prizes.map((p) => (
            <li key={p.id} className={styles.row}>
              <input
                className={styles.nameInput}
                type="text"
                value={p.name}
                maxLength={12}
                placeholder={copy.lotteryNamePlaceholder}
                aria-label={copy.lotteryNameLabel}
                disabled={spinning}
                onChange={(e) => update(p.id, { name: e.target.value })}
              />
              <input
                className={styles.weightInput}
                type="number"
                min={0}
                max={999}
                step={1}
                value={p.weight}
                aria-label={copy.lotteryWeightLabel}
                disabled={spinning}
                onChange={(e) =>
                  update(p.id, {
                    weight: Math.min(
                      999,
                      Math.max(0, Math.floor(Number(e.target.value) || 0)),
                    ),
                  })
                }
              />
              <span className={styles.percent}>
                {p.name.trim() === ""
                  ? copy.lotteryExcluded
                  : `${total > 0 ? ((p.weight / total) * 100).toFixed(1) : "0.0"}%`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(p.id)}
                disabled={spinning || prizes.length <= 1}
                aria-label={copy.lotteryRemove}
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
        <div className={styles.editorActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={add}
            disabled={spinning || prizes.length >= MAX_PRIZES}
          >
            {copy.lotteryAdd}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={spinning}
          >
            {copy.lotteryReset}
          </Button>
        </div>
        </div>
      </section>
    </div>
  );
}
