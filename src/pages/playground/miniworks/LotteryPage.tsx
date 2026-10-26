import Lottery from "../../../components/Lottery";
import TextLink from "../../../components/TextLink";
import { useTranslation } from "../../../i18n/useTranslation";
import styles from "./LotteryPage.module.scss";

export default function LotteryPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <TextLink to="/playground/mini-works" restoreScroll className={styles.back}>
        {t.playground.miniWorks.backToList}
      </TextLink>
      <Lottery />
      <p className={styles.caption}>{t.playground.miniWorks.lotteryCaption}</p>
    </div>
  );
}
