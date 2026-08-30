import WeatherBox from "../../../components/WeatherBox";
import TextLink from "../../../components/TextLink";
import { useTranslation } from "../../../i18n/useTranslation";
import styles from "./WeatherBoxPage.module.scss";

export default function WeatherBoxPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <TextLink to="/playground/mini-works" restoreScroll className={styles.back}>
        {t.playground.miniWorks.backToList}
      </TextLink>
      <WeatherBox />
      <p className={styles.caption}>
        {t.playground.miniWorks.weatherBoxCaption}
      </p>
    </div>
  );
}
