import { createElement, type CSSProperties, type ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Reveal.module.scss";

type RevealTag = "div" | "section" | "article" | "li" | "span" | "header" | "footer";

interface RevealProps {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  delay?: number; // ms，用來讓清單項目依序淡入
}

export default function Reveal({ as: Tag = "div", children, className, delay = 0 }: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return createElement(
    Tag,
    {
      ref,
      className: [styles.reveal, isVisible && styles.visible, className].filter(Boolean).join(" "),
      style,
    },
    children,
  );
}
