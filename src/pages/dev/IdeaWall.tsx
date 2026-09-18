import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Button from "../../components/Button";
import styles from "./IdeaWall.module.scss";

// 先用假資料把 UI 做出來給使用者看成品，之後接 Supabase 真實資料時
// 直接把這個陣列換成 useQuery 撈回來的 rows，欄位形狀先照這裡的假資料對齊。
// 日期刻意分散在不同月份，才看得出「依日期分組」切換起來有意義。
const MOCK_IDEAS = [
  {
    id: "1",
    text: "把生成藝術的作品做成明信片，寄給願意留地址的人",
    category: "網站",
    createdAt: "2026-06-10",
  },
  {
    id: "2",
    text: "知識關聯圖能不能讓使用者自己新增節點之間的連線？",
    category: "網站",
    createdAt: "2026-07-02",
  },
  {
    id: "3",
    text: "論文筆記讀多了，要不要做一個「研究方法小抄」頁面",
    category: "研究",
    createdAt: "2026-07-18",
  },
  {
    id: "4",
    text: "CodePulse 的難度曲線可以畫成一張互動圖表",
    category: "專案",
    createdAt: "2026-08-05",
  },
  {
    id: "5",
    text: "想法牆本身要不要也支援「已實現」的標記",
    category: "網站",
    createdAt: "2026-08-22",
  },
  {
    id: "6",
    text: "畫廊裡的作品能不能加一個「隨機播放」模式",
    category: "網站",
    createdAt: "2026-09-09",
  },
  {
    id: "7",
    text: "把履歷的每一段經歷都連回對應的專案或文章",
    category: "生活",
    createdAt: "2026-09-18",
  },
];

type LayoutMode = "date" | "category";

// 決定類別分組時的欄位順序；日期分組則是撈出現過的年月，照時間排序。
const CATEGORY_ORDER = ["網站", "研究", "專案", "生活"];

// 便條紙顏色跟類別綁定（不是隨機），沿用站上 Chip 的狀態色系（success／info／
// warn／danger）分辨類別，色相跟原本手選的馬卡龍色系一一對應（藍→info、綠→success、
// 黃→warn、珊瑚紅→danger），實際底色在 .module.scss 用 color-mix() 把狀態色調淡，
// 而不是直接拿 Chip 那組深色當底色（深色底配便條紙原本的深字會看不清楚）。
// 之後類別變多要記得在 CSS 補一組新的 categoryXxx 底色。
const CATEGORY_COLOR_CLASS: Record<string, string> = {
  網站: "categoryInfo",
  研究: "categorySuccess",
  專案: "categoryWarn",
  生活: "categoryDanger",
};
const FALLBACK_COLOR_CLASS = "categoryFallback";

// 3 種半透明膠帶色，跟便條紙顏色分開算，避免兩者剛好選到同一色系看起來像沒貼膠帶。
const TAPE_COLORS = [
  "rgba(250, 245, 230, 0.78)",
  "rgba(216, 158, 130, 0.7)",
  "rgba(150, 189, 186, 0.7)",
];

// 版面常數：一欄一個分組（日期或類別），欄位上緣是分組標籤，底下依序疊放
// 該分組的便條紙，類似參考圖「日期／類別當表頭，底下對應卡片」的結構。
const NOTE_SIZE = 176; // 對應 Tailwind 的 w-44
const COLUMN_WIDTH = 240;
const HEADER_TOP = 40;
const HEADER_HEIGHT = 56;
// ITEM_GAP 要跟下面 jitterY 的抖動幅度連動：同一欄相鄰兩張紙的最差情況（一張
// 抖到最下面、下一張抖到最上面）還是要留出實際間隔，不然便條紙會疊在一起。
// NOTE_SIZE(176) + jitterY 最大反向差(24，見 jitterY 的 ±12) + 想留的間隔(36)。
const ITEM_GAP = 236;
const GROUP_SIZE = 3; // 環境風分組大小，同一組共用一個風吹延遲（跟版面分組是兩件事）

// 用字串算出穩定的偽隨機值，同一則想法每次渲染的位置、歪斜角度、顏色都一樣，
// 不會因為重新渲染而抖動；不同用途（歪斜／位置／膠帶／風吹延遲）各自加不同的 salt
// 字串下去 hash，避免同一則想法的所有數值都被同一個種子連動。
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function groupKeyOf(idea: (typeof MOCK_IDEAS)[number], mode: LayoutMode): string {
  return mode === "category" ? idea.category : idea.createdAt.slice(0, 7);
}

function groupLabelOf(key: string, mode: LayoutMode): string {
  if (mode === "category") return key;
  const [year, month] = key.split("-");
  return `${year}/${month}`;
}

export default function IdeaWall() {
  const [mode, setMode] = useState<LayoutMode>("date");

  // .wall 現在是滿版鋪到 navbar 以下、剩餘視窗高度的容器，但欄位版面原本是用
  // 固定的 COLUMN_WIDTH／ITEM_GAP 算畫布尺寸，資料少的時候畫布會比容器小，被
  // TransformWrapper 的 minScale=1／limitToBounds 卡在容器角落，右側／下方留一
  // 大片空白。這裡量出容器實際尺寸，讓畫布跟著撐開到至少填滿容器，恢復「畫布 ≥
  // 容器」這個原本的版面假設。
  const [wallSize, setWallSize] = useState({ width: 0, height: 0 });
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWallSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const keys =
    mode === "category"
      ? CATEGORY_ORDER.filter((c) => MOCK_IDEAS.some((idea) => idea.category === c))
      : Array.from(
          new Set(MOCK_IDEAS.map((idea) => idea.createdAt.slice(0, 7))),
        ).sort();

  const groups = keys.map((key) => ({
    key,
    label: groupLabelOf(key, mode),
    items: MOCK_IDEAS.filter((idea) => groupKeyOf(idea, mode) === key),
  }));

  const maxItems = Math.max(1, ...groups.map((g) => g.items.length));
  const naturalCanvasWidth = groups.length * COLUMN_WIDTH + 80;
  // 容器比自然寬度寬時，欄寬跟著撐開撐滿；上限抓 2 倍避免類別數很少時單欄被拉到誇張寬。
  const columnWidth =
    wallSize.width > naturalCanvasWidth
      ? Math.min((wallSize.width - 80) / groups.length, COLUMN_WIDTH * 2)
      : COLUMN_WIDTH;
  const canvasWidth = Math.max(naturalCanvasWidth, groups.length * columnWidth + 80);
  // 高度不用重新分配間距（想法變多本來就該往下長，見上方欄寬的取捨），單純讓
  // 畫布至少跟容器一樣高，牆面材質貼滿，不會在便條紙底下露出一截容器背景。
  const naturalCanvasHeight = HEADER_TOP + HEADER_HEIGHT + maxItems * ITEM_GAP + 60;
  const canvasHeight = Math.max(naturalCanvasHeight, wallSize.height);

  return (
    <section className={styles.page}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">想法牆（預覽）</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            目前是假資料，之後會接 Supabase：只有我自己會在 Supabase
            後台直接新增／編輯，網站這邊維持唯讀。畫布可以拖曳移動、滾輪／雙指縮放；牆上的風是自己不規律吹的，滑鼠移到單一張便條紙則會讓那張晃一下。
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="排版依據">
          <Button
            variant={mode === "date" ? "primary" : "secondary"}
            onClick={() => setMode("date")}
          >
            依日期
          </Button>
          <Button
            variant={mode === "category" ? "primary" : "secondary"}
            onClick={() => setMode("category")}
          >
            依類別
          </Button>
        </div>
      </div>

      <div
        ref={wallRef}
        className={`${styles.wall} mt-8 ml-[calc(50%_-_50vw)] mr-[calc(50%_-_50vw)] w-screen`}
      >
        <TransformWrapper
          key={mode}
          initialScale={1}
          // minScale 設 1：畫布本來就比可視窗格大，不能縮得比原始尺寸更小，
          // 不然會露出畫布邊界外的空白。
          minScale={1}
          maxScale={2.5}
          centerOnInit
          centerZoomedOut
          fitOnInit="cover"
          limitToBounds
          wheel={{ step: 0.15 }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className={styles.controls}>
                <Button
                  variant="secondary"
                  onClick={() => zoomOut()}
                  aria-label="縮小"
                >
                  －
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => resetTransform()}
                  aria-label="重設視角"
                >
                  重設
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => zoomIn()}
                  aria-label="放大"
                >
                  ＋
                </Button>
              </div>
              <TransformComponent
                wrapperClass={styles.transformWrapper}
                contentClass={styles.transformContent}
              >
                <div
                  className={styles.board}
                  style={{ width: canvasWidth, height: canvasHeight }}
                >
                  {groups.map((group, colIndex) => (
                    <div
                      key={group.key}
                      className={`${styles.groupHeader} absolute rounded-md px-3 py-2 text-center text-sm font-semibold`}
                      style={{
                        left: colIndex * columnWidth + 40,
                        top: HEADER_TOP,
                        width: columnWidth - 40,
                      }}
                    >
                      {group.label}
                    </div>
                  ))}

                  {groups.map((group, colIndex) =>
                    group.items.map((idea, itemIndex) => {
                      const tilt = (hashString(idea.id) % 21) - 10; // -10deg ~ 10deg
                      const colorClass =
                        styles[CATEGORY_COLOR_CLASS[idea.category]] ??
                        styles[FALLBACK_COLOR_CLASS];
                      const gust = 4 + (hashString(`${idea.id}-gust`) % 5); // hover 搖晃用，跟風向無關
                      const tapeTilt = (hashString(`${idea.id}-tape`) % 17) - 8;
                      const tapeColor =
                        TAPE_COLORS[
                          hashString(`${idea.id}-tapeColor`) % TAPE_COLORS.length
                        ];

                      const flatIndex = MOCK_IDEAS.findIndex((i) => i.id === idea.id);
                      const wGroupIndex = Math.floor(flatIndex / GROUP_SIZE);
                      const groupDelay = hashString(`group-${wGroupIndex}`) % 8;

                      // 落在自己那欄、自己那一格的中心附近，格內再加隨機位移
                      const jitterX =
                        (hashString(`${idea.id}-jx`) % 41) - 20;
                      const jitterY = (hashString(`${idea.id}-jy`) % 25) - 12;
                      const left =
                        colIndex * columnWidth +
                        columnWidth / 2 -
                        NOTE_SIZE / 2 +
                        jitterX;
                      const top =
                        HEADER_TOP +
                        HEADER_HEIGHT +
                        20 +
                        itemIndex * ITEM_GAP +
                        jitterY;

                      return (
                        <div
                          key={idea.id}
                          tabIndex={0}
                          className={`${styles.note} ${colorClass} absolute flex w-44 flex-col rounded-sm p-4 focus:outline-none`}
                          style={
                            {
                              left,
                              top,
                              "--tilt": `${tilt}deg`,
                              "--gust": `${gust}deg`,
                              "--group-delay": `${groupDelay}s`,
                            } as React.CSSProperties
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={styles.tape}
                            style={
                              {
                                "--tape-tilt": `${tapeTilt}deg`,
                                "--tape-color": tapeColor,
                              } as React.CSSProperties
                            }
                          />
                          <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-[#2b2b1f]">
                            {idea.text}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs text-[#2b2b1f]/60">
                            <span>{idea.category}</span>
                            <span>{idea.createdAt}</span>
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </section>
  );
}
