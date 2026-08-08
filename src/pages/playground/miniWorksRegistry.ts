import type { ComponentType } from "react";
import type { Strings } from "../../i18n/strings";
import NameCardPage from "./miniworks/NameCardPage";
import BrandGuidePage from "./miniworks/BrandGuidePage";
import WeatherBoxPage from "./miniworks/WeatherBoxPage";

export interface MiniWorkDefinition {
  slug: string;
  Component: ComponentType;
  label: (t: Strings) => string;
  desc: (t: Strings) => string;
}

// 每個小作品的骨架（router 用的頁面元件）跟列表卡文案都集中在這裡，之後
// 加新作品只要在這裡多一筆，不用去改 router.tsx —— 跟 gallery/sketches
// 用 slug 對照表的做法一致。
export const miniWorks: MiniWorkDefinition[] = [
  {
    slug: "namecard",
    Component: NameCardPage,
    label: (t) => t.playground.miniWorks.nameCardLabel,
    desc: (t) => t.playground.miniWorks.nameCardDesc,
  },
  {
    slug: "brand-guide",
    Component: BrandGuidePage,
    label: (t) => t.playground.miniWorks.brandGuideLabel,
    desc: (t) => t.playground.miniWorks.brandGuideDesc,
  },
  {
    slug: "weather-box",
    Component: WeatherBoxPage,
    label: (t) => t.playground.miniWorks.weatherBoxLabel,
    desc: (t) => t.playground.miniWorks.weatherBoxDesc,
  },
];

export const miniWorkBySlug = (slug: string | undefined) =>
  miniWorks.find((work) => work.slug === slug);
