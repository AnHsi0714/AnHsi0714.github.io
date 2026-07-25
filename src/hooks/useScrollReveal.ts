import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends Element = HTMLDivElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // 只在第一次進入畫面時觸發，之後就算捲回去再捲下來也維持可見，
    // 避免使用者上下捲動時內容一直閃爍消失又出現
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
