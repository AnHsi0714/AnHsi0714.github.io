import nameCardDataZh from "../../../../content/namecard.json";
import nameCardDataEn from "../../../../content/namecard.en.json";
import type { NameCardContent } from "../../../types/content";
import NameCard from "../../../components/NameCard";
import TextLink from "../../../components/TextLink";
import { useLocalized } from "../../../lib/localized";
import { useTranslation } from "../../../i18n/useTranslation";
import styles from "./NameCardPage.module.scss";

export default function NameCardPage() {
  const { t } = useTranslation();
  const data = useLocalized(nameCardDataZh, nameCardDataEn) as NameCardContent;

  return (
    <div className={styles.page}>
      <TextLink to="/playground/mini-works" restoreScroll className={styles.back}>
        {t.playground.miniWorks.backToList}
      </TextLink>
      <NameCard />
      <p className={styles.caption}>{data.caption}</p>
    </div>
  );
}
