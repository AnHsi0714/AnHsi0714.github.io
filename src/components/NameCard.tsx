import { useEffect, useRef, useState } from "react";
import nameCardDataZh from "../../content/namecard.json";
import nameCardDataEn from "../../content/namecard.en.json";
import type { NameCardContent } from "../types/content";
import { useLocalized } from "../lib/localized";
import styles from "./NameCard.module.scss";

// 資訊（姓名／職稱／自介）的 opacity 淡入有 1s 延遲才開始（見
// NameCard.module.scss 的 transition: opacity 2s 1s），這裡拿同一個數字當
// 「有沒有顯示到資訊階段」的判斷門檻：滑鼠停留不到 1s，資訊根本還沒開始
// 淡入，離開時水印文字可以直接滑回來；停留超過 1s，資訊已經在畫面上，
// 就要讓水印晚一點再滑回來，避免跟資訊淡出的畫面疊在一起。
const INFO_REVEAL_DELAY = 1000;

export default function NameCard() {
  const data = useLocalized(nameCardDataZh, nameCardDataEn) as NameCardContent;
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [returnSlow, setReturnSlow] = useState(false);
  const infoShownRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setReturnSlow(false);
    infoShownRef.current = false;
    timerRef.current = setTimeout(() => {
      infoShownRef.current = true;
    }, INFO_REVEAL_DELAY);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setIsHovered(false);
    setIsClicked(false);
    setReturnSlow(infoShownRef.current);
  };

  const markClass = returnSlow ? styles.returnSlow : "";

  return (
    <div
      className={[
        styles.nameCard,
        isHovered && styles.isHovered,
        isClicked && styles.isClicked,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsClicked(true)}
    >
      <p className={styles.name}>{data.name}</p>
      <p className={styles.nameEnglish}>{data.nameEnglish}</p>
      <h5 className={styles.job}>{data.job}</h5>
      <hr className={styles.hr} />
      <p className={styles.aboutMe}>{data.about}</p>
      <span className={`${styles.circle} ${styles.circle1}`} />
      <span className={`${styles.circle} ${styles.circle3}`} />
      <span className={`${styles.circle} ${styles.circle2}`} />
      <span className={`${styles.mark} ${markClass}`}>NAME</span>
      <span className={`${styles.mark2} ${markClass}`}>CARD</span>
    </div>
  );
}
