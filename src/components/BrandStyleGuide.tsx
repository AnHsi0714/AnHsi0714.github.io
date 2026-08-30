import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCanadianMapleLeaf } from "@fortawesome/free-brands-svg-icons";
import TextLink from "./TextLink";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./BrandStyleGuide.module.scss";

const COLOR_CHIPS = [
  { hex: "#A5FFD6", block: styles.colorBlock1 },
  { hex: "#474973", block: styles.colorBlock2 },
  { hex: "#F3F7F7", block: styles.colorBlock3 },
  { hex: "#095256", block: styles.colorBlock4 },
];

function GuideSection({ theme }: { theme: string }) {
  return (
    <div className={`${styles.content} ${theme}`}>
      <div className={styles.maxWidth}>
        <h5>Style guideline</h5>
        <h1>品牌網頁視覺引導-40px 大標題</h1>
        <h1 className={styles.smallEnglish}>
          English Style guideline for h1 title
        </h1>
        <div className={styles.titleHr} />
        <br />

        <h2>品牌網頁視覺引導-30px 中標題</h2>
        <h2 className={styles.smallEnglish}>
          English Style guideline for h2 title
        </h2>
        <br />

        <h3>品牌網頁視覺引導-20px 小標題</h3>
        <h3 className={styles.smallEnglish}>
          English Style guideline for h3 title
        </h3>
        <br />

        <hr />
        <h5>VI COLORS</h5>
        {COLOR_CHIPS.map((chip) => (
          <div key={chip.hex} className={styles.colorChip}>
            <span className={styles.colorTag}>{chip.hex}</span>
            <span className={`${styles.colorBlock} ${chip.block}`} />
          </div>
        ))}

        <h5>BUTTON EXAMPLE</h5>
        <div className={styles.button}>Button</div>
        <div className={`${styles.button} ${styles.button1}`}>Button</div>
        <div className={`${styles.button} ${styles.button2}`}>Button</div>
      </div>
    </div>
  );
}

export default function BrandStyleGuide() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <TextLink to="/playground/mini-works" restoreScroll className={styles.back}>
        {t.playground.miniWorks.backToList}
      </TextLink>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCanadianMapleLeaf} className={styles.icon} />
      </div>
      <GuideSection theme={styles.content1} />
      <GuideSection theme={styles.content2} />
      <GuideSection theme={styles.content3} />
    </div>
  );
}
