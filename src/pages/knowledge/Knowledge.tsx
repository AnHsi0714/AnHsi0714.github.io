import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import { usePublishedKnowledgeNodes } from "../../lib/knowledge";
import { useTranslation } from "../../i18n/useTranslation";

export default function Knowledge() {
  const { t } = useTranslation();
  const nodes = usePublishedKnowledgeNodes();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const allCategories = useMemo(
    () => Array.from(new Set(nodes.map((node) => node.category))).sort(),
    [nodes],
  );

  const filteredNodes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return nodes
      .filter((node) => {
        if (
          keyword &&
          !node.term.toLowerCase().includes(keyword) &&
          !node.definition.toLowerCase().includes(keyword)
        ) {
          return false;
        }
        if (category && node.category !== category) return false;
        return true;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [nodes, query, category]);

  function updateParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams);
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    setSearchParams(params, { replace: true });
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.knowledge.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">{t.knowledge.subtitle}</p>

      <div className="mt-6 flex flex-col gap-4">
        <Input
          label={t.knowledge.searchPlaceholder}
          placeholder={t.knowledge.searchPlaceholder}
          value={query}
          onChange={(event) => updateParams({ q: event.target.value })}
          className="w-full sm:w-72"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={category === ""}
            onClick={() => updateParams({ category: "" })}
            className={[
              "rounded-full border px-3 py-1 text-sm transition-colors",
              category === ""
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
            ].join(" ")}
          >
            {t.knowledge.allCategories}
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => updateParams({ category: category === cat ? "" : cat })}
              className={[
                "rounded-full border px-3 py-1 text-sm transition-colors",
                category === cat
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredNodes.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t.knowledge.noMatch}
            description={t.knowledge.tryAdjustFilter}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredNodes.map((node) => (
            <Link key={node.slug} to={`/knowledge/${node.slug}`} className="block">
              <Card hoverable>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{node.term}</p>
                  <Chip size="sm">{node.category}</Chip>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                  {node.definition}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
