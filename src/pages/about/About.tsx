import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faDumbbell,
  faBook,
  faBaseball,
  faGamepad,
  faBasketball,
  faPaw,
  faLightbulb,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import Chip from "../../components/Chip";

const skillGroups = [
  {
    label: "Programming",
    items: ["Python", "TypeScript", "C++"],
  },
  {
    label: "Data & Visualization",
    items: ["D3.js", "Tableau", "R"],
  },
  {
    label: "Frontend",
    items: ["React", "Angular", "HTML / SCSS"],
  },
  {
    label: "Others",
    items: ["p5.js"],
  },
  {
    label: "專業方向",
    items: [
      "互動式資料視覺化",
      "資料分析與探索",
      "NLP Pipeline 設計與評估",
      "互動式演算法／資料結構視覺化",
      "Creative Coding / 藝術程式創作",
    ],
  },
];

const education = [
  "新北市樟樹實中 JICTS 資訊科",
  "國立臺北科技大學 NTUT 資工系 大三",
];

const academicRecord = [
  { sem: "一上", rank: 1, score: 92.5, bookroll: true },
  { sem: "一下", rank: 2, score: 91.8, bookroll: true },
  { sem: "二上", rank: 4, score: 87.2, bookroll: true },
  { sem: "二下", rank: 1, score: 96.0, bookroll: false },
  { sem: "三上", rank: 6, score: 94.0, bookroll: false },
];

const researchInterests = [
  {
    layer: "核心 Core",
    items: ["Visual Analytics", "Interactive Data Exploration"],
  },
  {
    layer: "支撐方法 Methods",
    items: [
      "Information Visualization",
      "Human-Computer Interaction",
      "Natural Language Processing",
      "Knowledge Graph",
    ],
  },
  {
    layer: "應用領域 Applied",
    items: [
      "Programming Education",
      "Developer Tools",
      "Human-AI Collaboration",
      "Software Engineering",
    ],
  },
];

const achievements = [
  {
    title: "資料結構與演算法視覺化教學平台 CodePulse",
    desc: "114 學年度 資工系實務專題｜指導教授 陳香君",
  },
  {
    title: "基於雙軌 NLP 技術之使用者回饋自動化分析語義模型",
    desc: "2026 年 6 月｜NLP 課程期末專題",
  },
];

const experienceHighlights = [
  { year: "2022", text: "全國工科技藝競賽 金手獎第七名" },
  { year: "2023", text: "赴美見學交流（亞特蘭大 & 舊金山）" },
  { year: "2023–25", text: "母校技藝競賽選手培訓教師" },
  { year: "2025 / 12", text: "教育大數據微學程 成果發表 佳作" },
  {
    year: "2025–27",
    text: "美商太陽鳥軟體 前端開發實習（Scrum / Sprint Review / 設計文件）",
  },
];

const interests = [
  { icon: faCode, label: "程式開發" },
  { icon: faLightbulb, label: "程式創作" },
  { icon: faDumbbell, label: "健身運動" },
  { icon: faBook, label: "閱讀書籍" },
  { icon: faBaseball, label: "Fubon" },
  { icon: faBasketball, label: "PLG" },
  { icon: faGamepad, label: "傳說 ONE" },
  { icon: faPaw, label: "狼人殺" },
];

export default function About() {
  const [showGrades, setShowGrades] = useState(false);

  return (
    <section className="flex flex-col lg:flex-row lg:-ml-[calc(50vw-50rem)]">
      <div className="lg:shrink-0 lg:w-[calc(50vw-25rem)] lg:sticky lg:top-1/2 lg:-translate-y-1/2 lg:self-start">
        <p className="text-7xl font-light leading-none text-[var(--color-text)] lg:text-[10rem]">
          About
        </p>
        <p className="mt-4 text-7xl font-light leading-none text-[var(--color-text)] lg:text-[10rem]">
          Me
        </p>
      </div>

      <div className="flex-1 divide-y divide-[var(--color-border)]">
        <div className="pb-6">
          <p className="font-semibold text-[var(--color-primary)]">
            專業技能 Skills
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) =>
                    group.label === "專業方向" ? (
                      <Chip key={item}>{item}</Chip>
                    ) : (
                      <span
                        key={item}
                        className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-sm text-[var(--color-text-muted)]"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學歷 Education
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-sm text-[var(--color-text-muted)]">
              {education[0]}
            </p>
            <button
              type="button"
              onClick={() => setShowGrades((g) => !g)}
              className="flex w-fit items-center gap-1 text-left text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className={`h-3 w-3 transition-transform duration-150 ${showGrades ? "rotate-90" : ""}`}
              />
              <span>{education[1]}</span>
            </button>
          </div>
          {showGrades && (
            <div className="mt-3 flex flex-col gap-1 pl-4">
              {academicRecord.map(({ sem, rank, score, bookroll }) => (
                <div
                  key={sem}
                  className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]"
                >
                  <span className="w-8 shrink-0">{sem}</span>
                  <span className="w-10 shrink-0 tabular-nums">#{rank}</span>
                  <span className="w-12 shrink-0 tabular-nums">{score}</span>
                  {bookroll && (
                    <Chip variant="warn" size="sm">
                      書卷
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="research-interests" className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            研究興趣 Research Interests
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {researchInterests.map(({ layer, items }) => (
              <div key={layer} className="flex items-baseline gap-3 text-sm">
                <span className="w-32 shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] opacity-80">
                  {layer}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {items.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學術成果 Academic Achievements
          </p>
          <div className="mt-2 flex flex-col gap-3 text-sm text-[var(--color-text-muted)]">
            {achievements.map((item) => (
              <div key={item.title}>
                <p className="text-[var(--color-text)]">{item.title}</p>
                <p className="mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            競賽與經歷 Experience
          </p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
            {experienceHighlights.map((item) => (
              <div key={item.text} className="flex items-baseline gap-3">
                <span className="w-14 shrink-0 text-xs text-[var(--color-text-muted)] opacity-80">
                  {item.year}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <Link
            to="/experience"
            className="mt-3 inline-block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            查看完整經歷 →
          </Link>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            休閒興趣 Interests
          </p>
          <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-2 text-sm text-[var(--color-text-muted)]">
            {interests.map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Button type="button">下載履歷 Download Resume</Button>
          <span className="mt-2 text-xs text-[var(--color-text-muted)]">
            （履歷檔案連結待補上）
          </span>
        </div>
      </div>
    </section>
  );
}
