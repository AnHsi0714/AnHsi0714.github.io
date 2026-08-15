import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type TrailItemType = "article" | "knowledge" | "project";

export interface TrailEntry {
  type: TrailItemType;
  slug: string;
}

const STORAGE_KEY = "trail";
const MAX_TRAIL = 4;

function getInitialTrail(): TrailEntry[] {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface TrailContextValue {
  trail: TrailEntry[];
  pushTrailEntry: (entry: TrailEntry) => void;
  jumpTrailTo: (index: number) => void;
  clearTrail: () => void;
}

const TrailContext = createContext<TrailContextValue | undefined>(undefined);

// 只在這次分頁的瀏覽期間有效（sessionStorage），關掉分頁或重新整理就重置，
// 符合「這次逛到哪」的直覺，不會累積成永久紀錄
export function TrailProvider({ children }: { children: ReactNode }) {
  const [trail, setTrail] = useState<TrailEntry[]>(getInitialTrail);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
  }, [trail]);

  // 一般內容連結（相關文章／知識點的 chip 等）點進詳情頁都走這裡：單純累加，
  // 即使 A、B 互相關聯、來回點也不去重找重複，A→B→A 就是三站，不是合併回 A
  const pushTrailEntry = useCallback((entry: TrailEntry) => {
    setTrail((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === entry.type && last.slug === entry.slug) return prev;
      return [...prev, entry].slice(-MAX_TRAIL);
    });
  }, []);

  // 只有直接點擊軌跡列本身的某一站才走這裡：代表要跳回那個分岔點，
  // 後面沒逛過的路徑要丟掉，而不是像一般連結那樣接在後面
  const jumpTrailTo = useCallback((index: number) => {
    setTrail((prev) => prev.slice(0, index + 1));
  }, []);

  // 回到列表（或任何非詳情頁）代表一次瀏覽流程結束，軌跡歸零，
  // 下次點進詳情頁才會從頭開始累積，不會接到上一輪逛的東西
  const clearTrail = useCallback(() => {
    setTrail((prev) => (prev.length === 0 ? prev : []));
  }, []);

  return (
    <TrailContext.Provider
      value={{ trail, pushTrailEntry, jumpTrailTo, clearTrail }}
    >
      {children}
    </TrailContext.Provider>
  );
}

export function useTrail() {
  const ctx = useContext(TrailContext);
  if (!ctx) throw new Error("useTrail must be used within TrailProvider");
  return ctx;
}
