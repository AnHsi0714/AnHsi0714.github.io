import { Link } from "react-router-dom";
import WeatherBox from "../../../components/WeatherBox";
import { useTranslation } from "../../../i18n/useTranslation";
import styles from "./WeatherBoxPage.module.scss";

export default function WeatherBoxPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <Link to="/playground/mini-works" className={styles.back}>
        {t.playground.miniWorks.backToList}
      </Link>
      <WeatherBox />
      <p className={styles.caption}>
        {t.playground.miniWorks.weatherBoxCaption}
      </p>
    </div>
  );
}
