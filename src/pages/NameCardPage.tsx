import { Link } from "react-router-dom";
import nameCardDataZh from "../../content/namecard.json";
import nameCardDataEn from "../../content/namecard.en.json";
import type { NameCardContent } from "../types/content";
import NameCard from "../components/NameCard";
import { useLocalized } from "../lib/localized";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./NameCardPage.module.scss";

export default function NameCardPage() {
  const { t } = useTranslation();
  const data = useLocalized(nameCardDataZh, nameCardDataEn) as NameCardContent;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        {t.common.backToHome}
      </Link>
      <NameCard />
      <p className={styles.caption}>{data.caption}</p>
    </div>
  );
}
