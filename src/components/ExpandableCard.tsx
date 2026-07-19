import { useState, type KeyboardEvent, type ReactNode } from "react";
import Card from "./Card";
import Modal from "./Modal";
import styles from "./ExpandableCard.module.scss";

interface ExpandableCardProps {
  /** 圖片（如果有），固定顯示在卡片與展開內容的最上方 */
  image?: ReactNode;
  /** 卡片本身顯示的（可能被截斷的）預覽內容 */
  children: ReactNode;
  /** 點擊卡片後，於全螢幕置中遮罩顯示的完整內容 */
  expandedContent: ReactNode;
  /** 作品介紹專用：展開面板改成「美術館說明牌」造型（暖紙色、無圓角、遮罩加深）。
   * 預設 false，一般內容維持跟頁面同色系的普通面板。 */
  placard?: boolean;
  hoverable?: boolean;
  className?: string;
}

export default function ExpandableCard({
  image,
  children,
  expandedContent,
  placard = false,
  hoverable = true,
  className,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <>
      <Card
        hoverable={hoverable}
        className={className}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleTriggerKeyDown}
      >
        {image}
        {children}
      </Card>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        placard={placard}
        backdropClassName={styles.backdrop}
        panelClassName={styles.panel}
      >
        {image}
        {expandedContent}
      </Modal>
    </>
  );
}
