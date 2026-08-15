import { useEffect, useState } from "react";

// 用來判斷「這頁內容有沒有超出視窗高度」，底部的回列表連結只在真的會捲動時才出現，
// 避免內容很短、根本不用捲動的頁面同時看到頂部跟底部兩個一樣的連結
export function useNeedsScroll(): boolean {
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const check = () => {
      setNeedsScroll(
        document.documentElement.scrollHeight > window.innerHeight,
      );
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("load", check);

    const observer = new ResizeObserver(check);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("load", check);
      observer.disconnect();
    };
  }, []);

  return needsScroll;
}
