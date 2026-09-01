import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router-dom";
import Chip from "../../components/Chip";
import Reveal from "../../components/Reveal";
import TextLink from "../../components/TextLink";
import { usePublishedKnowledgeNodes } from "../../lib/knowledge";
import { useTranslation } from "../../i18n/useTranslation";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./KnowledgeGraph.module.scss";

const WIDTH = 900;
const HEIGHT = 620;
const PADDING = 50;
const ITERATIONS = 260;
const CATEGORY_PREFIX = "cat:";

const CATEGORY_COLORS: Record<string, string> = {
  ALGO: "#6366f1",
  EVAL: "#f97316",
  NLP: "#ec4899",
  DB: "#14b8a6",
  WEB: "#3b82f6",
  RESEARCH: "#84cc16",
};
const FALLBACK_COLOR = "#9ca3af";

// 圖上實際畫出來的節點：分類還沒展開時是一顆代表整個分類的 hub，
// 展開後 hub 換成該分類底下每個知識點各自一顆節點。
interface VisualNode {
  id: string;
  label: string;
  category: string;
  kind: "category" | "knowledge";
  slug?: string;
}

interface GraphEdge {
  a: string;
  b: string;
  directed: boolean;
}

interface Point {
  x: number;
  y: number;
}

type NodeColorStyle = CSSProperties & { "--node-color": string };

function idFor(category: string, slug: string, expanded: Set<string>): string {
  return expanded.has(category) ? slug : CATEGORY_PREFIX + category;
}

// 純數值版力導向布局：節點互斥、邊當彈簧、同分類節點被拉往各自的錨點聚成一叢。
// 不用 requestAnimationFrame 動畫，直接同步跑滿固定次數迭代後取最終位置渲染，
// 避免額外引入 d3-force 之類的相依套件，好裝也好整個砍掉。
// seed：上一次算出來的位置，已經在圖上的節點從原地接著模擬，只有新出現的節點
// 才從分類錨點附近的隨機點開始，避免每次展開/收合分類整張圖位置全部重洗。
function computeLayout(
  nodes: VisualNode[],
  edges: GraphEdge[],
  seed: Record<string, Point>,
): Record<string, Point> {
  const categories = Array.from(new Set(nodes.map((n) => n.category)));
  const categoryAnchor: Record<string, Point> = {};
  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2;
    categoryAnchor[cat] = {
      x: WIDTH / 2 + Math.cos(angle) * 220,
      y: HEIGHT / 2 + Math.sin(angle) * 200,
    };
  });

  const pos: Record<string, Point> = {};
  const vel: Record<string, Point> = {};
  nodes.forEach((n) => {
    const anchor = categoryAnchor[n.category];
    pos[n.id] = seed[n.id]
      ? { ...seed[n.id] }
      : {
          x: anchor.x + (Math.random() - 0.5) * 100,
          y: anchor.y + (Math.random() - 0.5) * 100,
        };
    vel[n.id] = { x: 0, y: 0 };
  });

  for (let step = 0; step < ITERATIONS; step++) {
    const force: Record<string, Point> = {};
    nodes.forEach((n) => (force[n.id] = { x: 0, y: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].id;
        const b = nodes[j].id;
        const dx = pos[a].x - pos[b].x;
        const dy = pos[a].y - pos[b].y;
        const distSq = Math.max(dx * dx + dy * dy, 1);
        const repulsion = 1800 / distSq;
        const dist = Math.sqrt(distSq);
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;
        force[a].x += fx;
        force[a].y += fy;
        force[b].x -= fx;
        force[b].y -= fy;
      }
    }

    edges.forEach((edge) => {
      const a = pos[edge.a];
      const b = pos[edge.b];
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const restLength = 110;
      const springForce = (dist - restLength) * 0.02;
      const fx = (dx / dist) * springForce;
      const fy = (dy / dist) * springForce;
      force[edge.a].x += fx;
      force[edge.a].y += fy;
      force[edge.b].x -= fx;
      force[edge.b].y -= fy;
    });

    nodes.forEach((n) => {
      const anchor = categoryAnchor[n.category];
      force[n.id].x += (anchor.x - pos[n.id].x) * 0.01;
      force[n.id].y += (anchor.y - pos[n.id].y) * 0.01;
    });

    nodes.forEach((n) => {
      const v = vel[n.id];
      v.x = (v.x + force[n.id].x) * 0.85;
      v.y = (v.y + force[n.id].y) * 0.85;
      pos[n.id].x += v.x;
      pos[n.id].y += v.y;
    });
  }

  const xs = Object.values(pos).map((p) => p.x);
  const ys = Object.values(pos).map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(
    (WIDTH - PADDING * 2) / Math.max(maxX - minX, 1),
    (HEIGHT - PADDING * 2) / Math.max(maxY - minY, 1),
  );

  const normalized: Record<string, Point> = {};
  nodes.forEach((n) => {
    normalized[n.id] = {
      x: PADDING + (pos[n.id].x - minX) * scale,
      y: PADDING + (pos[n.id].y - minY) * scale,
    };
  });
  return normalized;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function KnowledgeGraph() {
  const { t } = useTranslation();
  useDocumentTitle(`${t.knowledge.graphViewTitle} · AnHsi0714`, t.knowledge.graphViewSubtitle);
  const allNodes = usePublishedKnowledgeNodes();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // manualPositions：使用者手動拖過的節點位置，蓋過力導向模擬算出來的位置。
  const [manualPositions, setManualPositions] = useState<Record<string, Point>>({});
  // 拖曳中的節點才關掉 left/top 的 transition，不然節點會用 300ms 慢半拍跟著游標跑。
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const positionsRef = useRef<Record<string, Point>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  // 拖曳中的節點 id；拖過（moved）才在放開時吃掉那次 click，
  // 單純點一下（沒移動）還是要正常導頁／展開分類。
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const categoriesWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    allNodes.forEach((n) => counts.set(n.category, (counts.get(n.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [allNodes]);

  const rawEdges = useMemo(() => {
    const seen = new Map<string, GraphEdge>();
    const slugSet = new Set(allNodes.map((n) => n.slug));
    allNodes.forEach((node) => {
      (node.relatedNodes ?? []).forEach((rel) => {
        if (!slugSet.has(rel.slug)) return;
        const key = [node.slug, rel.slug].sort().join("|");
        if (seen.has(key)) return;
        if (rel.type === "prerequisite") {
          // rel.slug 是 node.slug 的先備知識，箭頭畫成「先備 → 這個節點」
          seen.set(key, { a: rel.slug, b: node.slug, directed: true });
        } else {
          seen.set(key, { a: node.slug, b: rel.slug, directed: false });
        }
      });
    });
    return Array.from(seen.values());
  }, [allNodes]);

  const categoryBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    allNodes.forEach((n) => (map[n.slug] = n.category));
    return map;
  }, [allNodes]);

  const visibleNodes: VisualNode[] = useMemo(() => {
    const byCategory = new Map<string, typeof allNodes>();
    allNodes.forEach((n) => {
      const list = byCategory.get(n.category) ?? [];
      list.push(n);
      byCategory.set(n.category, list);
    });
    const result: VisualNode[] = [];
    byCategory.forEach((members, category) => {
      if (expandedCategories.has(category)) {
        members.forEach((m) =>
          result.push({ id: m.slug, label: m.term, category, kind: "knowledge", slug: m.slug }),
        );
      } else {
        result.push({
          id: CATEGORY_PREFIX + category,
          label: `${category} (${members.length})`,
          category,
          kind: "category",
        });
      }
    });
    return result;
  }, [allNodes, expandedCategories]);

  // 分類還收合著的邊，兩端都會收斂成同一顆分類 hub，這種「分類內部關聯」先不畫，
  // 展開該分類後兩端變成各自獨立的節點才會出現。
  const visibleEdges: GraphEdge[] = useMemo(() => {
    const grouped = new Map<string, GraphEdge>();
    rawEdges.forEach((e) => {
      const va = idFor(categoryBySlug[e.a], e.a, expandedCategories);
      const vb = idFor(categoryBySlug[e.b], e.b, expandedCategories);
      if (va === vb) return;
      const key = [va, vb].sort().join("|");
      const existing = grouped.get(key);
      if (existing && (existing.directed || !e.directed)) return;
      grouped.set(key, { a: va, b: vb, directed: e.directed });
    });
    return Array.from(grouped.values());
  }, [rawEdges, categoryBySlug, expandedCategories]);

  const layoutKey = visibleNodes
    .map((n) => n.id)
    .sort()
    .join(",");
  // eslint 沒裝，這裡刻意只依賴 layoutKey（可見節點的 id 集合），不依賴 visibleNodes/
  // visibleEdges 物件參照，避免切換語言時 usePublishedKnowledgeNodes() 換新物件參照
  // 就觸發重新跑物理模擬
  const positions = useMemo(
    () => computeLayout(visibleNodes, visibleEdges, positionsRef.current),
    [layoutKey],
  );

  // 手動拖過的位置優先，同時寫回 positionsRef，展開/收合分類重跑模擬時
  // 才會從使用者喬好的位置接著算，不會被模擬結果蓋掉。
  const effectivePositions = useMemo(
    () => ({ ...positions, ...manualPositions }),
    [positions, manualPositions],
  );

  useEffect(() => {
    positionsRef.current = { ...positionsRef.current, ...effectivePositions };
  }, [effectivePositions]);

  const neighborIds = useMemo(() => {
    if (!activeId) return null;
    const set = new Set<string>([activeId]);
    visibleEdges.forEach((edge) => {
      if (edge.a === activeId) set.add(edge.b);
      if (edge.b === activeId) set.add(edge.a);
    });
    return set;
  }, [activeId, visibleEdges]);

  const handlePointerDown = (id: string) => (event: ReactPointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, moved: false };
    setDraggingId(id);
  };

  const handlePointerMove = (id: string) => (event: ReactPointerEvent) => {
    if (dragRef.current?.id !== id) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current.moved = true;
    const x = clamp(((event.clientX - rect.left) / rect.width) * WIDTH, 0, WIDTH);
    const y = clamp(((event.clientY - rect.top) / rect.height) * HEIGHT, 0, HEIGHT);
    setManualPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const handlePointerUp = (id: string) => (event: ReactPointerEvent) => {
    if (dragRef.current?.id !== id) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDraggingId(null);
    // moved 留著給接下來那次 click 判斷要不要吃掉，click 處理完再清空
  };

  // 剛拖完放開節點會緊接著觸發一次 click，這裡攔下來避免拖曳誤觸導頁／展開分類；
  // 單純點一下（dragRef.moved 是 false）就放行，交給 Link/button 原本的行為。
  const consumeDragClick = (id: string, event: { preventDefault: () => void }): boolean => {
    if (dragRef.current?.id === id && dragRef.current.moved) {
      event.preventDefault();
      dragRef.current = null;
      return true;
    }
    dragRef.current = null;
    return false;
  };

  return (
    <section>
      <Reveal>
        <h1 className="text-2xl font-bold">{t.knowledge.graphViewTitle}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {t.knowledge.graphViewSubtitle}
        </p>
        <TextLink to="/knowledge" restoreScroll className="mt-1 block text-sm">
          {t.knowledge.backToList}
        </TextLink>
      </Reveal>

      <p className="mt-4 text-sm text-[var(--color-text-muted)] sm:hidden">
        {t.knowledge.graphViewMobileNotice}
      </p>

      <div className="hidden sm:block">
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          → {t.knowledge.relationType.prerequisite}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {categoriesWithCount.map(({ category, count }) => (
            <Chip
              key={category}
              clickable
              selected={expandedCategories.has(category)}
              onClick={() => toggleCategory(category)}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className={styles.legendDot}
                style={{ "--node-color": CATEGORY_COLORS[category] ?? FALLBACK_COLOR } as NodeColorStyle}
              />
              {category} ({count})
            </Chip>
          ))}
        </div>

        <div className={styles.canvas} ref={canvasRef}>
          <svg
            className={styles.edges}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" />
              </marker>
            </defs>
            {visibleEdges.map((edge) => {
              const a = effectivePositions[edge.a];
              const b = effectivePositions[edge.b];
              if (!a || !b) return null;
              const isActive = activeId != null && (edge.a === activeId || edge.b === activeId);
              const isDimmed = activeId != null && !isActive;
              return (
                <line
                  key={`${edge.a}-${edge.b}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={[
                    styles.edge,
                    isActive ? styles.edgeActive : "",
                    isDimmed ? styles.edgeDimmed : "",
                  ].join(" ")}
                  markerEnd={edge.directed ? "url(#arrow)" : undefined}
                />
              );
            })}
          </svg>

          {visibleNodes.map((node) => {
            const p = effectivePositions[node.id];
            if (!p) return null;
            const isDimmed = neighborIds != null && !neighborIds.has(node.id);
            const isActive = activeId === node.id;
            const colorStyle = {
              left: `${(p.x / WIDTH) * 100}%`,
              top: `${(p.y / HEIGHT) * 100}%`,
              "--node-color": CATEGORY_COLORS[node.category] ?? FALLBACK_COLOR,
            } as NodeColorStyle;
            const className = [
              styles.node,
              node.kind === "category" ? styles.hub : "",
              isDimmed ? styles.nodeDimmed : "",
              isActive ? styles.nodeActive : "",
              draggingId === node.id ? styles.dragging : "",
            ].join(" ");

            if (node.kind === "category") {
              return (
                <button
                  key={node.id}
                  type="button"
                  className={className}
                  style={colorStyle}
                  onMouseEnter={() => setActiveId(node.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(node.id)}
                  onBlur={() => setActiveId(null)}
                  onPointerDown={handlePointerDown(node.id)}
                  onPointerMove={handlePointerMove(node.id)}
                  onPointerUp={handlePointerUp(node.id)}
                  onClick={(event) => {
                    if (consumeDragClick(node.id, event)) return;
                    toggleCategory(node.category);
                  }}
                >
                  <span className={styles.dot} />
                  <span className={styles.label}>{node.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={node.id}
                to={`/knowledge/${node.slug}`}
                className={className}
                style={colorStyle}
                onMouseEnter={() => setActiveId(node.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(node.id)}
                onBlur={() => setActiveId(null)}
                onPointerDown={handlePointerDown(node.id)}
                onPointerMove={handlePointerMove(node.id)}
                onPointerUp={handlePointerUp(node.id)}
                onClick={(event) => consumeDragClick(node.id, event)}
              >
                <span className={styles.dot} />
                <span className={styles.label}>{node.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
