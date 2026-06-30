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
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Button from "../../components/Button";

const skillGroups = [
  {
    label: "語言 & 工具",
    items: [
      "Python", "C++", "TypeScript", "Angular", "React",
      "HTML / SCSS", "SQL", "R", "D3.js", "p5.js",
    ],
  },
  {
    label: "專業方向",
    items: [
      "演算法設計與分析（複雜度、圖論、排序、搜尋）",
      "互動式資料結構 / 演算法視覺化",
      "NLP Pipeline 設計與評估",
      "互動式資料視覺化",
      "前端工程實踐（Scrum / Sprint Review / 設計文件）",
      "藝術程式創作",
    ],
  },
];

const education = [
  "新北市樟樹實中 JICTS 資訊科",
  "國立臺北科技大學 NTUT 資工系 大三",
];

const researchInterests = [
  "Information Visualization",
  "Interactive Visualization",
  "Programming Education",
  "NLP",
  "Explainable AI",
  "Human-AI Interaction",
  "Generative Art",
  "Creative Coding",
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
  { year: "2025–", text: "美商太陽鳥軟體 前端開發實習" },
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
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-sm text-[var(--color-text-muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            學歷 Education
          </p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
            {education.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            研究興趣 Research Interests
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
            {researchInterests.map((item) => (
              <span key={item}>{item}</span>
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
                <span className="w-14 shrink-0 text-xs text-[var(--color-text-muted)] opacity-60">
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
