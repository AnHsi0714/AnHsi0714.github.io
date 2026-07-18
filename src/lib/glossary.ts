import glossaryDataZh from "../../content/glossary.json";
import glossaryDataEn from "../../content/glossary.en.json";
import type { GlossaryEntry } from "../types/content";
import { useLanguage } from "../context/LanguageContext";

const glossaryByLang: Record<string, Record<string, GlossaryEntry>> = {
  zh: glossaryDataZh,
  en: glossaryDataEn,
};

export function useGlossary(): Record<string, GlossaryEntry> {
  const { language } = useLanguage();
  return glossaryByLang[language];
}
