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
import Reveal from "../../components/Reveal";
import TextLink from "../../components/TextLink";
import { useTranslation } from "../../i18n/useTranslation";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { deriveExcerpt } from "../../lib/markdown";

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
          "互動式演算法／資料結構視覺化",
        ],
      },
    ],
    education: [
      "新北市樟樹實中 JICTS 資訊科",
      "國立臺北科技大學 NTUT 資工系 大三",
    ],
    academicSummary: {
      rank: "Rank: 3/63",
      percentile: "4.8%",
      gpa: "3.98/4.00",
    },
    researchInterests: [
      {
        layer: "核心研究方向 Core",
        items: [
          "Human-Centered Computing",
          "Human-Computer Interaction",
          "Interactive Systems",
        ],
      },
      {
        layer: "互動與資訊 Interaction & Info",
        items: [
          "Information Visualization",
          "Interactive Data Exploration",
          "UI/UX",
        ],
      },
      {
        layer: "社會與智慧系統 Social & Intelligent Systems",
        items: ["Social Computing", "Human-AI Collaboration", "Human Behavior"],
      },
      {
        layer: "學習與教育 Learning & Education",
        items: [
          "Programming Education",
          "Interactive Learning Systems",
          "Developer Tools",
        ],
      },
      {
        layer: "研究方法 Methods",
        items: ["User Research", "Data Analysis", "Empirical Evaluation"],
      },
      {
        layer: "創意與計算 Creative & Computational",
        items: ["Creative Coding", "Creative Technology"],
      },
    ],
    researchStatement: [
      "CodePulse 是我和團隊打造的 DSA 視覺化學習平台，整合互動式視覺化與程式執行追蹤；我主要負責前端互動與動畫設計，以及使用者研究的前後測設計、執行與分析。功能做完後，我更想知道：這樣的介面設計，真的能讓使用者學得更好嗎？",
      "我設計了 A/B 版本交換的前後測研究，觀察使用者能否把學習內容遷移到新題目。結果顯示使用者對繼續學習演算法的信心顯著提升（p < 0.001），但測驗成績只是正向趨勢、未達統計顯著。這讓我意識到主觀信心與客觀學習成效得分開驗證，也讓我發現自己過去對互動設計是否有效的判斷，多半仍停留在直覺層次。",
      "這是我想投入 CSCW / Social Computing-oriented HCI 研究所方向的原因：學習更嚴謹的使用者研究方法，把「好不好用」的直覺換成能被驗證的研究問題。同時我也保留兩個延伸興趣：Information Visualization 與 Technology-Supported Learning，作為實踐 CSCW 想法時常用的工具與應用場域。",
    ],
    achievements: [
      {
        title: "資料結構與演算法視覺化教學平台 CodePulse",
        desc: "114 學年度 資工系實務專題｜指導教授 陳香君｜曾投件國科會大專生研究計畫",
      },
      {
        title: "基於雙軌 NLP 技術之使用者回饋自動化分析語義模型",
        desc: "2026 年 6 月｜NLP 課程期末專題",
      },
    ],
    experienceHighlights: [
      { year: "2022", text: "全國工科技藝競賽 金手獎第七名" },
      { year: "2023 / 05", text: "赴美見學交流（亞特蘭大 & 舊金山）" },
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
          "Interactive Algorithm / Data Structure Visualization",
        ],
      },
    ],
    education: [
      "New Taipei Municipal Zhangshu Experimental High School, JICTS Information Technology Program",
      "National Taipei University of Technology (NTUT), Dept. of Computer Science & Information Engineering, Junior (3rd year)",
    ],
    academicSummary: {
      rank: "3/63",
      percentile: "4.8%",
      gpa: "3.98/4.00",
    },
    researchInterests: [
      {
        layer: "Core",
        items: [
          "Human-Centered Computing",
          "Human-Computer Interaction",
          "Interactive Systems",
        ],
      },
      {
        layer: "Interaction & Info",
        items: [
          "Information Visualization",
          "Interactive Data Exploration",
          "UI/UX",
        ],
      },
      {
        layer: "Social & Intelligent Systems",
        items: ["Social Computing", "Human-AI Collaboration", "Human Behavior"],
      },
      {
        layer: "Learning & Education",
        items: [
          "Programming Education",
          "Interactive Learning Systems",
          "Developer Tools",
        ],
      },
      {
        layer: "Methods",
        items: ["User Research", "Data Analysis", "Empirical Evaluation"],
      },
      {
        layer: "Creative & Computational",
        items: ["Creative Coding", "Creative Technology"],
      },
    ],
    researchStatement: [
      "CodePulse is a DSA visualization learning platform I built with my team, combining interactive visualization with program execution tracing; I led the frontend interaction and animation design, plus the pre/post user study's design, execution, and analysis. Once the features worked, what I really wanted to know was: does this interface design actually help people learn better?",
      "I designed a pre/post study with A/B version swaps to see whether users could transfer what they'd learned to new problems. Confidence in continuing to learn algorithms rose significantly (p < 0.001), but test scores only trended positive without reaching significance. That taught me subjective confidence and objective learning gains need to be validated separately, and that my own judgments about whether interaction design \"works\" had mostly stayed at the level of intuition.",
      "That's why I want to pursue graduate research in CSCW / Social Computing-oriented HCI, learning rigorous user-research methods to turn intuitions about usability into falsifiable research questions. I carry two secondary interests alongside it: Information Visualization and Technology-Supported Learning, the tools and domains I keep returning to when putting CSCW ideas into practice.",
    ],
    achievements: [
      {
        title:
          "CodePulse: Data Structures & Algorithms Visualization Teaching Platform",
        desc: "2025 Academic Year Capstone Project, Dept. of CSIE ｜ Advisor: Annette Chen ｜ Submitted to the NSTC Undergraduate Research Program",
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
        text: "National Skills Competition, 7th Place, Golden Hand Award",
      },
      {
        year: "2023 / 05",
        text: "US Study Exchange (Atlanta & San Francisco)",
      },
      { year: "2023~2025", text: "Skills Competition Coach at Alma Mater" },
      {
        year: "2025 / 12",
        text: "Educational Big Data Micro-Program, Honorable Mention",
      },
      {
        year: "2025~2027",
        text: "Sun Bird Software, Frontend Development Intern (Scrum / Sprint Review / Design Docs)",
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
  useDocumentTitle(
    `${t.nav.about} · AnHsi0714`,
    deriveExcerpt(data.researchStatement.join(" "), 150),
  );

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
        <Reveal>
          <div id="research-interests" className="pb-6">
            <p className="font-semibold text-[var(--color-primary)]">
              {t.about.researchInterests}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {data.researchInterests.map(({ layer, items }) => (
                <div key={layer}>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] opacity-80">
                    {layer}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {items.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="py-6">
            <p className="font-semibold text-[var(--color-primary)]">
              {t.about.researchStatement}
            </p>
            <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {data.researchStatement.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
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
                        <Chip key={item} tone="filled">
                          {item}
                        </Chip>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
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
              <div className="mt-3 flex items-center gap-4 pl-4 text-sm tabular-nums text-[var(--color-text-muted)]">
                <span>{data.academicSummary.rank}</span>
                <span>{data.academicSummary.percentile}</span>
                <span>GPA {data.academicSummary.gpa}</span>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal>
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
            <TextLink
              to="/experience"
              className="mt-3 inline-block text-sm font-medium"
            >
              {t.about.viewFullExperience}
            </TextLink>
          </div>
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal>
          <div id="resume" className="flex flex-col items-start gap-2 pt-6">
            <a href="/resume.pdf" download>
              <Button type="button">{t.about.downloadResume}</Button>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
