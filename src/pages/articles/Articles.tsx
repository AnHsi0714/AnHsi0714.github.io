import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Chip from "../../components/Chip";
import type { Article } from "../../types/content";
import { articles } from "../../lib/articles";

const allCategories = Array.from(
  new Set(articles.flatMap((article) => article.categories)),
);

type SortOrder = "newest" | "oldest";

export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`評分 ${rating} / 5`} className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-[var(--color-border)]">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const subtitle = article.author
    ? `${article.author} · ${article.date}`
    : article.date;

  return (
    <Link to={`/articles/${article.slug}`} className="block">
      <Card className="flex items-start gap-4">
        {article.coverUrl ? (
          <img
            src={article.coverUrl}
            alt={article.title}
            className="h-20 w-20 shrink-0 rounded-md object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] text-2xl font-semibold text-[var(--color-border)] sm:h-24 sm:w-24">
            {article.title.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{article.title}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
            {article.excerpt}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex flex-wrap justify-end gap-1">
            {article.categories.map((category) => (
              <Chip key={category} size="sm">{category}</Chip>
            ))}
          </div>
          {article.rating !== undefined && <Stars rating={article.rating} />}
        </div>
      </Card>
    </Link>
  );
}

export default function Articles() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const activeFilterCount =
    (titleQuery ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        if (
          titleQuery &&
          !article.title.toLowerCase().includes(titleQuery.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          selectedCategories.length > 0 &&
          !article.categories.some((category) =>
            selectedCategories.includes(category),
          )
        ) {
          return false;
        }
        if (minRating > 0 && (article.rating ?? 0) < minRating) return false;
        if (dateFrom && article.date < dateFrom) return false;
        if (dateTo && article.date > dateTo) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [titleQuery, selectedCategories, minRating, dateFrom, dateTo, sortOrder]);

  return (
    <section>
      <h1 className="text-2xl font-bold">文章</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">讀過的書、寫下的筆記與心得。</p>

      <div className="relative mt-6 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          篩選 / 排序{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="搜尋標題"
                placeholder="輸入標題關鍵字"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />

              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text)]">
                最低評分
                <select
                  value={minRating}
                  onChange={(event) => setMinRating(Number(event.target.value))}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-normal text-[var(--color-text)]"
                >
                  <option
                    value={0}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    不限
                  </option>
                  <option
                    value={5}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    5★
                  </option>
                  <option
                    value={4}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    4★ 以上
                  </option>
                  <option
                    value={3}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    3★ 以上
                  </option>
                  <option
                    value={2}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    2★ 以上
                  </option>
                  <option
                    value={1}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    1★ 以上
                  </option>
                </select>
              </label>

              <Input
                label="起始日期"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label="結束日期"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">排序</span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                最新
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                最久
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="沒有符合條件的內容"
            description="試試調整篩選條件。"
          />
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {filteredArticles.map((article) => (
            <li key={article.slug}>
              <ArticleRow article={article} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
