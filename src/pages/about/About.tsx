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
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import TextLink from "../../components/TextLink";
import { useTranslation } from "../../i18n/useTranslation";

const content = {
  zh: {
    skillGroups: [
      { label: "Programming", items: ["Python", "TypeScript", "C++"] },
      {
        label: "Data & Visualization",
        items: ["D3.js", "Tableau", "R"],
      },
      { label: "Frontend", items: ["React", "Angular", "HTML / SCSS"] },
      { label: "Others", items: ["p5.js"] },
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
    ],
    education: [
      "新北市樟樹實中 JICTS 資訊科",
      "國立臺北科技大學 NTUT 資工系 大三",
    ],
    academicRecord: [
      { sem: "一上", rank: 1, score: 92.5, bookroll: true },
      { sem: "一下", rank: 2, score: 91.8, bookroll: true },
      { sem: "二上", rank: 4, score: 87.2, bookroll: true },
      { sem: "二下", rank: 1, score: 96.0, bookroll: false },
      { sem: "三上", rank: 6, score: 94.0, bookroll: false },
    ],
    researchInterests: [
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
    ],
    researchStatement:
      "CodePulse 讓我發現「介面做得好」跟「使用者真的學得更好」是兩件需要分開驗證的事——前後測顯示學習信心顯著提升，但測驗分數只是正向趨勢、未達統計顯著，這個落差比拿到漂亮的準確率數字更讓我想深入理解，也是我想申請 Visual Analytics／HCI 方向研究所的原因：想學習更嚴謹的使用者研究方法，把「工具好不好用」的直覺判斷換成能被驗證、能被反駁的研究問題。ABSA Pipeline 則讓我對方法取捨產生興趣——規則式流程可解釋、零成本，但天花板受限於隱含語意；LLM 覆蓋率高，卻是黑盒且有 API 成本，兩者沒有絕對優劣，端看場景需求。研究所階段希望把這兩個興趣收斂在一起：研究人機協作的介面設計與評估方法，讓開發者工具、程式教育這類系統不只是功能堆得多，而是有實證支持它真的有幫助。",
    achievements: [
      {
        title: "資料結構與演算法視覺化教學平台 CodePulse",
        desc: "114 學年度 資工系實務專題｜指導教授 陳香君",
      },
      {
        title: "基於雙軌 NLP 技術之使用者回饋自動化分析語義模型",
        desc: "2026 年 6 月｜NLP 課程期末專題",
      },
    ],
    experienceHighlights: [
      { year: "2022", text: "全國工科技藝競賽 金手獎第七名" },
      { year: "2023 / 5", text: "赴美見學交流（亞特蘭大 & 舊金山）" },
      { year: "2023~2025", text: "母校技藝競賽選手培訓教師" },
      { year: "2025 / 12", text: "教育大數據微學程 成果發表 佳作" },
      {
        year: "2025~2027",
        text: "美商太陽鳥軟體 前端開發實習（Scrum / Sprint Review / 設計文件）",
      },
    ],
    interests: [
      { icon: faCode, label: "程式開發" },
      { icon: faLightbulb, label: "程式創作" },
      { icon: faDumbbell, label: "健身運動" },
      { icon: faBook, label: "閱讀書籍" },
      { icon: faBaseball, label: "Fubon" },
      { icon: faBasketball, label: "PLG" },
      { icon: faGamepad, label: "傳說 ONE" },
      { icon: faPaw, label: "狼人殺" },
    ],
  },
  en: {
    skillGroups: [
      { label: "Programming", items: ["Python", "TypeScript", "C++"] },
      {
        label: "Data & Visualization",
        items: ["D3.js", "Tableau", "R"],
      },
      { label: "Frontend", items: ["React", "Angular", "HTML / SCSS"] },
      { label: "Others", items: ["p5.js"] },
      {
        label: "專業方向",
        items: [
          "Interactive Data Visualization",
          "Data Analysis & Exploration",
          "NLP Pipeline Design & Evaluation",
          "Interactive Algorithm / Data Structure Visualization",
          "Creative Coding / Generative Art",
        ],
      },
    ],
    education: [
      "New Taipei Municipal Zhangshu Experimental High School, JICTS Information Technology Program",
      "National Taipei University of Technology (NTUT), Dept. of Computer Science & Information Engineering — Junior (3rd year)",
    ],
    academicRecord: [
      { sem: "Y1 S1", rank: 1, score: 92.5, bookroll: true },
      { sem: "Y1 S2", rank: 2, score: 91.8, bookroll: true },
      { sem: "Y2 S1", rank: 4, score: 87.2, bookroll: true },
      { sem: "Y2 S2", rank: 1, score: 96.0, bookroll: false },
      { sem: "Y3 S1", rank: 6, score: 94.0, bookroll: false },
    ],
    researchInterests: [
      {
        layer: "Core",
        items: ["Visual Analytics", "Interactive Data Exploration"],
      },
      {
        layer: "Methods",
        items: [
          "Information Visualization",
          "Human-Computer Interaction",
          "Natural Language Processing",
          "Knowledge Graph",
        ],
      },
      {
        layer: "Applied",
        items: [
          "Programming Education",
          "Developer Tools",
          "Human-AI Collaboration",
          "Software Engineering",
        ],
      },
    ],
    researchStatement:
      "Working on CodePulse taught me that a well-designed interface and measurably better learning outcomes are two separate claims that need to be verified independently — our pre/post study showed a significant gain in learners' confidence, yet test scores only trended positive without reaching statistical significance. That gap is what actually pulled me toward Visual Analytics / HCI as a graduate research direction: I want to learn more rigorous user-research methods so that intuitions about whether a tool \"feels usable\" become falsifiable research questions instead. The ABSA pipeline project sharpened a related interest in method trade-offs — a rule-based pipeline is interpretable and free to run but capped by implicit semantics it can't resolve, while an LLM covers more cases but is a costlier black box; neither is strictly better, it depends on the context. Going forward, I hope to bring these two interests together: studying interface design and evaluation methods for human-AI collaboration, so that developer tools and programming-education systems are judged not by how many features they ship, but by evidence that they actually help.",
    achievements: [
      {
        title:
          "CodePulse — Data Structures & Algorithms Visualization Teaching Platform",
        desc: "2025 Academic Year Capstone Project, Dept. of CSIE ｜ Advisor: 陳香君",
      },
      {
        title:
          "A Dual-Track NLP Approach to Automated Semantic Analysis of User Feedback",
        desc: "June 2026 ｜ NLP Course Final Project",
      },
    ],
    experienceHighlights: [
      {
        year: "2022",
        text: "National Skills Competition — 7th Place, Golden Hand Award",
      },
      { year: "2023 / 5", text: "US Study Exchange (Atlanta & San Francisco)" },
      { year: "2023~2025", text: "Skills Competition Coach at Alma Mater" },
      {
        year: "2025 / 12",
        text: "Educational Big Data Micro-Program — Honorable Mention",
      },
      {
        year: "2025~2027",
        text: "Sun Bird Software — Frontend Development Intern (Scrum / Sprint Review / Design Docs)",
      },
    ],
    interests: [
      { icon: faCode, label: "Coding" },
      { icon: faLightbulb, label: "Creative Coding" },
      { icon: faDumbbell, label: "Fitness" },
      { icon: faBook, label: "Reading" },
      { icon: faBaseball, label: "Fubon" },
      { icon: faBasketball, label: "PLG" },
      { icon: faGamepad, label: "Legend ONE" },
      { icon: faPaw, label: "Werewolf" },
    ],
  },
};

export default function About() {
  const [showGrades, setShowGrades] = useState(false);
  const { t, language } = useTranslation();
  const data = content[language];

  return (
    <section className="flex flex-col gap-8 lg:relative lg:left-1/2 lg:grid lg:w-screen lg:-translate-x-1/2 lg:grid-cols-[10%_30%_5%_45%_10%]">
      <div className="flex flex-wrap items-baseline gap-x-4 lg:block lg:sticky lg:top-1/2 lg:col-start-2 lg:-translate-y-1/2 lg:self-start">
        <p className="text-5xl font-light leading-none text-[var(--color-text)] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]">
          About
        </p>
        <p className="text-5xl font-light leading-none text-[var(--color-text)] sm:text-6xl md:text-7xl lg:mt-3 lg:text-8xl xl:text-9xl 2xl:text-[10rem]">
          Me
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border)] lg:col-start-4">
        <div id="research-interests" className="pb-6">
          <p className="font-semibold text-[var(--color-primary)]">
            {t.about.researchInterests}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {data.researchInterests.map(({ layer, items }) => (
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
            {t.about.researchStatement}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {data.researchStatement}
          </p>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            {t.about.skills}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {data.skillGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                  {group.label === "專業方向"
                    ? t.about.professionalDirection
                    : group.label}
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
            {t.about.education}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-sm text-[var(--color-text-muted)]">
              {data.education[0]}
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
              <span>{data.education[1]}</span>
            </button>
          </div>
          {showGrades && (
            <div className="mt-3 flex flex-col gap-1 pl-4">
              {data.academicRecord.map(({ sem, rank, score, bookroll }) => (
                <div
                  key={sem}
                  className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]"
                >
                  <span className="w-10 shrink-0">{sem}</span>
                  <span className="w-10 shrink-0 tabular-nums">#{rank}</span>
                  <span className="w-12 shrink-0 tabular-nums">{score}</span>
                  {bookroll && (
                    <Chip variant="warn" size="sm">
                      {t.about.bookroll}
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            {t.about.academicAchievements}
          </p>
          <div className="mt-2 flex flex-col gap-3 text-sm text-[var(--color-text-muted)]">
            {data.achievements.map((item) => (
              <div key={item.title}>
                <p className="text-[var(--color-text)]">{item.title}</p>
                <p className="mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            {t.about.experience}
          </p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
            {data.experienceHighlights.map((item) => (
              <div key={item.text} className="flex items-baseline gap-3">
                <span className="w-14 shrink-0 text-xs text-[var(--color-text-muted)] opacity-80">
                  {item.year}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <TextLink to="/experience" className="mt-3 inline-block text-sm font-medium">
            {t.about.viewFullExperience}
          </TextLink>
        </div>

        <div className="py-6">
          <p className="font-semibold text-[var(--color-primary)]">
            {t.about.interests}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-2 text-sm text-[var(--color-text-muted)]">
            {data.interests.map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div id="resume" className="flex flex-col items-start gap-2 pt-6">
          <Button type="button">{t.about.downloadResume}</Button>
          <span className="text-xs text-[var(--color-text-muted)]">
            {t.about.resumePending}
          </span>
        </div>
      </div>
    </section>
  );
}
