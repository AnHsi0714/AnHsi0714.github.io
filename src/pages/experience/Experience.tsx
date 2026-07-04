import Chip from "../../components/Chip";
import type { ChipVariant } from "../../components/Chip";

interface Tag {
  label: string;
  variant: ChipVariant;
}

interface SecondaryEntry {
  period: string;
  title: string;
  result: string;
  tags: Tag[];
}

const entries = [
  {
    period: "2022 / 11",
    title: "全國工科技藝競賽 電腦軟體設計",
    subtitle: "金手獎第七名",
    tags: [{ label: "競賽", variant: "success" }] as Tag[],
    highlights: [
      "使用 VB 撰寫六題實作程式試題，全數解出",
      "涵蓋資料結構、基礎演算法、版面設計、元件應用、資料處理",
      "備賽期間每日練習 7–8 小時，強化邏輯分析與實作速度",
    ],
  },
  {
    period: "2023 / 05",
    title: "新北金手團赴美見學",
    subtitle: "亞特蘭大 & 舊金山",
    tags: [{ label: "海外", variant: "success" }] as Tag[],
    highlights: [
      "與當地學伴進行文化與教育交流，共同學習專業技術",
      "參訪多項知名景點，進行景點成功要素分析",
      "擴展國際視野，觀察海外教育與科技應用現況",
    ],
  },
  {
    period: "2023 – 2025",
    title: "母校技藝競賽選手培訓",
    subtitle: "教導後三屆電腦軟體設計選手",
    tags: [{ label: "教學", variant: "success" }] as Tag[],
    highlights: [
      "帶領選手獲得優勝 * 2",
      "嘗試多元教學方式：搭配影片、自創題型、規劃課程主題、針對弱點補強",
      "訓練過程強化口述與問題分析能力",
    ],
  },
  {
    period: "2025 / 07 – 2027 / 01",
    title: "美商太陽鳥軟體股份有限公司 台灣分公司",
    subtitle: "前端開發組　實習",
    tags: [{ label: "實習", variant: "info" }] as Tag[],
    highlights: [
      "使用 Angular 進行前端功能開發與維護，撰寫 HTML、SCSS、TypeScript",
      "參與完整前端開發流程，包含 Code Review、Sprint Review",
      "撰寫技術文件與開發設計文件，負責前端架構規劃",
      "使用 Kanban 協作分工，每週更新 High Level Estimate 給 PM",
      "熟悉敏捷開發節奏與專案規模估算",
    ],
  },
  {
    period: "2025 / 12",
    title: "教育大數據微學程 114學年度 專題成果發表競賽",
    subtitle: "國中數位學習政策的長期效應分析（三人團隊）　佳作",
    tags: [{ label: "研究", variant: "default" }] as Tag[],
    highlights: [
      "探討國中數位學習政策推行前後的學習成效差異",
      "三人分工完成資料蒐集、分析與成果報告",
    ],
  },
];

const secondaryEntries: SecondaryEntry[] = [
  {
    period: "2021 / 11 & 2022 / 10",
    title: "宏國德霖科大 電腦與通訊工程系 程式設計競賽",
    result: "第一名（2022）、第三名（2021）",
    tags: [{ label: "競賽", variant: "success" }] as Tag[],
  },
  {
    period: "2022",
    title: "第八屆新北市英文菁英盃 AI 詞彙組",
    result: "高職一般生組 金腦獎",
    tags: [{ label: "競賽", variant: "success" }] as Tag[],
  },
  {
    period: "高中",
    title: "PVQC 英語詞彙能力國際認證",
    result: "ICT・AI Literacy・eSports・電機 Specialist 第5級",
    tags: [{ label: "認證", variant: "default" }] as Tag[],
  },
];

export default function Experience() {
  return (
    <section>
      <h1 className="text-2xl font-bold">競賽與經歷</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        參與過的競賽、交流活動與工作經歷。
      </p>

      <div className="mt-10 flex flex-col gap-0">
        {entries.map((entry, index) => (
          <div key={entry.title} className="flex gap-6">
            {/* 左側：日期 */}
            <div className="w-36 shrink-0 pt-1 text-right text-sm text-[var(--color-text-muted)]">
              {entry.period}
            </div>

            {/* 中間：時間軸線 */}
            <div className="flex flex-col items-center">
              <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]" />
              {index < entries.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-[var(--color-border)]" />
              )}
            </div>

            {/* 右側：內容 */}
            <div className="pb-10 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[var(--color-text)]">
                  {entry.title}
                </p>
                {entry.tags.map((tag) => (
                  <Chip key={tag.label} variant={tag.variant} size="sm">
                    {tag.label}
                  </Chip>
                ))}
              </div>
              {entry.subtitle && (
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                  {entry.subtitle}
                </p>
              )}
              <ul className="mt-2 flex flex-col gap-1">
                {entry.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-border)]" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {secondaryEntries.length > 0 && (
        <div className="mt-2">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
            其他獎項
          </h2>
          <div className="mt-3 flex flex-col gap-2 border-l-2 border-[var(--color-border)] pl-4">
            {secondaryEntries.map((entry) => (
              <div
                key={entry.title + entry.period}
                className="flex flex-wrap items-center gap-x-2 gap-y-1"
              >
                <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                  {entry.period}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ·
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {entry.title}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ·
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {entry.result}
                </span>
                {entry.tags.map((tag) => (
                  <Chip key={tag.label} variant={tag.variant} size="sm">
                    {tag.label}
                  </Chip>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
