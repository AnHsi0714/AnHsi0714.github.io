import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Chip from "../../components/Chip";
import Reveal from "../../components/Reveal";
import TextLink from "../../components/TextLink";
import { usePublishedKnowledgeNodes } from "../../lib/knowledge";
import { useTranslation } from "../../i18n/useTranslation";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { KnowledgeRelationType } from "../../types/content";
import styles from "./KnowledgeGraph.module.scss";

const CATEGORY_PREFIX = "cat:";
const ITERATIONS = 260;
// 力導向常數：分類錨點半徑、節點互斥力、彈簧靜止長度都是舊版 2D 版本（單位是
// px）等比例縮小成 three.js 世界座標單位（縮放係數約 1/45），彈簧強度、錨點拉力、
// 阻尼是無因次係數，原封不動沿用。
const ANCHOR_RADIUS = 4.8;
const REPULSION = 0.9;
const REST_LENGTH = 2.4;
const SPRING_STRENGTH = 0.02;
const ANCHOR_PULL = 0.01;
const DAMPING = 0.85;
const JITTER = 2.2;

const CATEGORY_COLORS: Record<string, string> = {
  ALGO: "#6366f1",
  EVAL: "#f97316",
  NLP: "#ec4899",
  DB: "#14b8a6",
  WEB: "#3b82f6",
  RESEARCH: "#84cc16",
};
const FALLBACK_COLOR = "#9ca3af";

// 「相關概念」是最普通、數量最多的關係，維持中性色（跟主題走），
// 另外三種比較少見、有特定語意的關係才給固定的強調色。
const RELATION_ACCENT_COLORS: Partial<Record<KnowledgeRelationType, string>> = {
  prerequisite: "#f59e0b",
  applies_to: "#22c55e",
  contrasts_with: "#ef4444",
};
// 跟 KnowledgeDetail.tsx 的 relationOrder 保持一致的顯示順序。
const RELATION_LEGEND_ORDER: KnowledgeRelationType[] = [
  "prerequisite",
  "applies_to",
  "related",
  "contrasts_with",
];
// 分類收合時，同一對 hub 之間可能同時存在好幾種底層關係，只畫得出一條邊，
// 排序在前的優先顯示（先備知識最值得看到，相關概念最普通、優先度最低）。
const RELATION_PRIORITY: KnowledgeRelationType[] = [
  "prerequisite",
  "contrasts_with",
  "applies_to",
  "related",
];

function relationColor(type: KnowledgeRelationType, neutralColor: string): string {
  return RELATION_ACCENT_COLORS[type] ?? neutralColor;
}

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
  type: KnowledgeRelationType;
}

interface Point3 {
  x: number;
  y: number;
  z: number;
}

type NodeColorStyle = CSSProperties & { "--node-color": string };
type EdgeColorStyle = CSSProperties & { "--edge-color": string };

function idFor(category: string, slug: string, expanded: Set<string>): string {
  return expanded.has(category) ? slug : CATEGORY_PREFIX + category;
}

// 分類錨點均勻分布在球面上（Fibonacci sphere），取代 2D 版本沿一圈平面圓分布，
// 這樣分類數不多時錨點也不會全部擠在同一個平面上。
function fibonacciSpherePoint(index: number, total: number): Point3 {
  if (total <= 1) return { x: 0, y: 0, z: 0 };
  const phi = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  };
}

// 純數值版力導向布局（3D）：節點互斥、邊當彈簧、同分類節點被拉往各自的錨點聚成一叢。
// 不用 requestAnimationFrame 動畫，直接同步跑滿固定次數迭代後取最終位置渲染。
// seed：上一次算出來的位置，已經在圖上的節點從原地接著模擬，只有新出現的節點
// 才從分類錨點附近的隨機點開始，避免每次展開/收合分類整張圖位置全部重洗。
function computeLayout3D(
  nodes: VisualNode[],
  edges: GraphEdge[],
  seed: Record<string, Point3>,
): Record<string, Point3> {
  const categories = Array.from(new Set(nodes.map((n) => n.category)));
  const categoryAnchor: Record<string, Point3> = {};
  categories.forEach((cat, i) => {
    const dir = fibonacciSpherePoint(i, categories.length);
    categoryAnchor[cat] = {
      x: dir.x * ANCHOR_RADIUS,
      y: dir.y * ANCHOR_RADIUS,
      z: dir.z * ANCHOR_RADIUS,
    };
  });

  const pos: Record<string, Point3> = {};
  const vel: Record<string, Point3> = {};
  nodes.forEach((n) => {
    const anchor = categoryAnchor[n.category];
    pos[n.id] = seed[n.id]
      ? { ...seed[n.id] }
      : {
          x: anchor.x + (Math.random() - 0.5) * JITTER,
          y: anchor.y + (Math.random() - 0.5) * JITTER,
          z: anchor.z + (Math.random() - 0.5) * JITTER,
        };
    vel[n.id] = { x: 0, y: 0, z: 0 };
  });

  for (let step = 0; step < ITERATIONS; step++) {
    const force: Record<string, Point3> = {};
    nodes.forEach((n) => (force[n.id] = { x: 0, y: 0, z: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].id;
        const b = nodes[j].id;
        const dx = pos[a].x - pos[b].x;
        const dy = pos[a].y - pos[b].y;
        const dz = pos[a].z - pos[b].z;
        const distSq = Math.max(dx * dx + dy * dy + dz * dz, 0.02);
        const repulsion = REPULSION / distSq;
        const dist = Math.sqrt(distSq);
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;
        const fz = (dz / dist) * repulsion;
        force[a].x += fx;
        force[a].y += fy;
        force[a].z += fz;
        force[b].x -= fx;
        force[b].y -= fy;
        force[b].z -= fz;
      }
    }

    edges.forEach((edge) => {
      const a = pos[edge.a];
      const b = pos[edge.b];
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.02);
      const springForce = (dist - REST_LENGTH) * SPRING_STRENGTH;
      const fx = (dx / dist) * springForce;
      const fy = (dy / dist) * springForce;
      const fz = (dz / dist) * springForce;
      force[edge.a].x += fx;
      force[edge.a].y += fy;
      force[edge.a].z += fz;
      force[edge.b].x -= fx;
      force[edge.b].y -= fy;
      force[edge.b].z -= fz;
    });

    nodes.forEach((n) => {
      const anchor = categoryAnchor[n.category];
      force[n.id].x += (anchor.x - pos[n.id].x) * ANCHOR_PULL;
      force[n.id].y += (anchor.y - pos[n.id].y) * ANCHOR_PULL;
      force[n.id].z += (anchor.z - pos[n.id].z) * ANCHOR_PULL;
    });

    nodes.forEach((n) => {
      const v = vel[n.id];
      v.x = (v.x + force[n.id].x) * DAMPING;
      v.y = (v.y + force[n.id].y) * DAMPING;
      v.z = (v.z + force[n.id].z) * DAMPING;
      pos[n.id].x += v.x;
      pos[n.id].y += v.y;
      pos[n.id].z += v.z;
    });
  }

  // 整體置中到原點，camera 才能固定看向 (0,0,0) 而不用管節點數量、分類數變化。
  const centroid = { x: 0, y: 0, z: 0 };
  nodes.forEach((n) => {
    centroid.x += pos[n.id].x;
    centroid.y += pos[n.id].y;
    centroid.z += pos[n.id].z;
  });
  const count = Math.max(nodes.length, 1);
  centroid.x /= count;
  centroid.y /= count;
  centroid.z /= count;

  const centered: Record<string, Point3> = {};
  nodes.forEach((n) => {
    centered[n.id] = {
      x: pos[n.id].x - centroid.x,
      y: pos[n.id].y - centroid.y,
      z: pos[n.id].z - centroid.z,
    };
  });
  return centered;
}

// 邊、箭頭顏色是 CSS 變數（跟著淺色/深色主題換），three.js 的 Color 不吃 var()，
// 只能自己讀 computed style。切換主題的 useTheme() 在別的元件裡各管各的 state，
// 沒有共用 context 可以訂閱，用 MutationObserver 盯 <html> 的 class 屬性變化來同步。
function useCssColor(varName: string, fallback: string): string {
  const readColor = () => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || fallback;
  };
  const [color, setColor] = useState(readColor);

  useEffect(() => {
    setColor(readColor());
    const observer = new MutationObserver(() => setColor(readColor()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varName]);

  return color;
}

interface GraphNodeProps {
  node: VisualNode;
  position: Point3;
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onToggleCategory: (category: string) => void;
  onNavigate: (slug: string) => void;
}

function GraphNode({
  node,
  position,
  isActive,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onToggleCategory,
  onNavigate,
}: GraphNodeProps) {
  const colorStyle = {
    "--node-color": CATEGORY_COLORS[node.category] ?? FALLBACK_COLOR,
  } as NodeColorStyle;
  const className = [
    styles.node,
    node.kind === "category" ? styles.hub : "",
    isDimmed ? styles.nodeDimmed : "",
    isActive ? styles.nodeActive : "",
  ].join(" ");
  const content = (
    <>
      <span className={styles.dot} />
      <span className={styles.label}>{node.label}</span>
    </>
  );

  return (
    <Html position={[position.x, position.y, position.z]} center>
      {node.kind === "category" ? (
        <button
          type="button"
          className={className}
          style={colorStyle}
          onPointerEnter={onHoverStart}
          onPointerLeave={onHoverEnd}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          onClick={() => onToggleCategory(node.category)}
        >
          {content}
        </button>
      ) : (
        // 這裡故意不用 react-router 的 <Link>：<Html> 底下的內容雖然還是同一棵
        // React tree（context 邏輯上會傳下來），但 r3f 的 <Canvas> 是用自己另一個
        // reconciler 掛載子節點，Link 需要的 Router context 實際上並不會跨過這個
        // 邊界（這也是 drei 特地做了 useContextBridge 的原因）。用一般 <a> + 外層
        // 傳進來的 navigate() 就完全繞開這個問題。
        <a
          href={`/knowledge/${node.slug}`}
          className={className}
          style={colorStyle}
          onPointerEnter={onHoverStart}
          onPointerLeave={onHoverEnd}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(node.slug!);
          }}
        >
          {content}
        </a>
      )}
    </Html>
  );
}

interface ArrowHeadProps {
  from: Point3;
  to: Point3;
  color: string;
  opacity: number;
}

// 箭頭沿線縮進一小段擺在終點前面，避免整顆錐體蓋在節點的圓點/文字標籤上。
function ArrowHead({ from, to, color, opacity }: ArrowHeadProps) {
  const { position, quaternion } = useMemo(() => {
    const start = new THREE.Vector3(from.x, from.y, from.z);
    const end = new THREE.Vector3(to.x, to.y, to.z);
    const direction = end.clone().sub(start);
    const length = direction.length() || 1;
    direction.normalize();
    const inset = Math.min(0.45, length * 0.35);
    const conePosition = end.clone().sub(direction.clone().multiplyScalar(inset));
    const coneQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction,
    );
    return { position: conePosition, quaternion: coneQuaternion };
  }, [from.x, from.y, from.z, to.x, to.y, to.z]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[0.09, 0.24, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

interface EdgeLineProps {
  edge: GraphEdge;
  positions: Record<string, Point3>;
  isActive: boolean;
  isDimmed: boolean;
  color: string;
  activeColor: string;
}

function EdgeLine({ edge, positions, isActive, isDimmed, color, activeColor }: EdgeLineProps) {
  const a = positions[edge.a];
  const b = positions[edge.b];
  if (!a || !b) return null;
  const lineColor = isActive ? activeColor : relationColor(edge.type, color);
  const opacity = isDimmed ? 0.15 : 1;

  return (
    <>
      <Line
        points={[
          [a.x, a.y, a.z],
          [b.x, b.y, b.z],
        ]}
        color={lineColor}
        lineWidth={isActive ? 2 : 1}
        transparent
        opacity={opacity}
      />
      {edge.type === "prerequisite" && (
        <ArrowHead from={a} to={b} color={lineColor} opacity={opacity} />
      )}
    </>
  );
}

export default function KnowledgeGraph() {
  const { t } = useTranslation();
  useDocumentTitle(`${t.knowledge.graphViewTitle} · AnHsi0714`, t.knowledge.graphViewSubtitle);
  const navigate = useNavigate();
  const allNodes = usePublishedKnowledgeNodes();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const positionsRef = useRef<Record<string, Point3>>({});
  const edgeColor = useCssColor("--color-border", "#cecece");
  const activeEdgeColor = useCssColor("--color-primary", "#2f4f4f");

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
          seen.set(key, { a: rel.slug, b: node.slug, type: "prerequisite" });
        } else {
          seen.set(key, { a: node.slug, b: rel.slug, type: rel.type });
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

  // 分類還收合著的邊,兩端都會收斂成同一顆分類 hub，這種「分類內部關聯」先不畫，
  // 展開該分類後兩端變成各自獨立的節點才會出現。多個成員對之間的關係可能種類不同，
  // 收斂到同一對 hub 時只留優先度最高的那種（先備 > 對比 > 應用 > 相關）代表整條邊。
  const visibleEdges: GraphEdge[] = useMemo(() => {
    const grouped = new Map<string, GraphEdge>();
    rawEdges.forEach((e) => {
      const va = idFor(categoryBySlug[e.a], e.a, expandedCategories);
      const vb = idFor(categoryBySlug[e.b], e.b, expandedCategories);
      if (va === vb) return;
      const key = [va, vb].sort().join("|");
      const existing = grouped.get(key);
      if (existing && RELATION_PRIORITY.indexOf(existing.type) <= RELATION_PRIORITY.indexOf(e.type))
        return;
      grouped.set(key, { a: va, b: vb, type: e.type });
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
    () => computeLayout3D(visibleNodes, visibleEdges, positionsRef.current),
    [layoutKey],
  );

  useEffect(() => {
    positionsRef.current = { ...positionsRef.current, ...positions };
  }, [positions]);

  const neighborIds = useMemo(() => {
    if (!activeId) return null;
    const set = new Set<string>([activeId]);
    visibleEdges.forEach((edge) => {
      if (edge.a === activeId) set.add(edge.b);
      if (edge.b === activeId) set.add(edge.a);
    });
    return set;
  }, [activeId, visibleEdges]);

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

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
        {RELATION_LEGEND_ORDER.map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            {type === "prerequisite" ? (
              <span
                className={styles.legendArrow}
                style={{ "--edge-color": relationColor(type, edgeColor) } as EdgeColorStyle}
                aria-hidden="true"
              >
                →
              </span>
            ) : (
              <span
                className={styles.legendLine}
                style={{ "--edge-color": relationColor(type, edgeColor) } as EdgeColorStyle}
              />
            )}
            {t.knowledge.relationType[type]}
          </span>
        ))}
      </div>

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

      <div className={styles.canvas}>
        <Canvas camera={{ position: [0, 0, ANCHOR_RADIUS * 2.6], fov: 50 }} gl={{ alpha: true }}>
          {visibleEdges.map((edge) => {
            const isActive = activeId != null && (edge.a === activeId || edge.b === activeId);
            const isDimmed = activeId != null && !isActive;
            return (
              <EdgeLine
                key={`${edge.a}-${edge.b}`}
                edge={edge}
                positions={positions}
                isActive={isActive}
                isDimmed={isDimmed}
                color={edgeColor}
                activeColor={activeEdgeColor}
              />
            );
          })}

          {visibleNodes.map((node) => {
            const p = positions[node.id];
            if (!p) return null;
            const isDimmed = neighborIds != null && !neighborIds.has(node.id);
            const isActive = activeId === node.id;
            return (
              <GraphNode
                key={node.id}
                node={node}
                position={p}
                isActive={isActive}
                isDimmed={isDimmed}
                onHoverStart={() => setActiveId(node.id)}
                onHoverEnd={() => setActiveId(null)}
                onToggleCategory={toggleCategory}
                onNavigate={(slug) => navigate(`/knowledge/${slug}`)}
              />
            );
          })}

          <OrbitControls
            enableDamping
            dampingFactor={0.15}
            minDistance={ANCHOR_RADIUS * 1.1}
            maxDistance={ANCHOR_RADIUS * 5}
          />
        </Canvas>
      </div>
    </section>
  );
}
