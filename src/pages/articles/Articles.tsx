import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Chip from "../../components/Chip";
import TextLink from "../../components/TextLink";
import type { Article } from "../../types/content";
import { useArticles } from "../../lib/articles";
import { useTranslation } from "../../i18n/useTranslation";
import type { Strings } from "../../i18n/strings";

type SortOrder = "newest" | "oldest";
type FeaturedFilter = "all" | "featured" | "not-featured";

export function Stars({ rating, t }: { rating: number; t: Strings }) {
  return (
    <span aria-label={t.articles.ratingLabel(rating)} className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-[var(--color-border)]">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ArticleRow({ article, t }: { article: Article; t: Strings }) {
  const subtitle = article.author
    ? `${article.author} · ${article.date}`
    : article.date;

  return (
    <div className="relative">
      {article.featured && (
        <span
          title={t.common.pinned}
          aria-label={t.common.pinned}
          className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-text)",
          }}
        >
          <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
        </span>
      )}
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
            {article.rating !== undefined && <Stars rating={article.rating} t={t} />}
          </div>
        </Card>
      </Link>
    </div>
  );
}

export default function Articles() {
  const { t } = useTranslation();
  const articles = useArticles();
  const allCategories = Array.from(
    new Set(articles.flatMap((article) => article.categories)),
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");

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
    (dateTo ? 1 : 0) +
    (featuredFilter !== "all" ? 1 : 0);

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
        if (featuredFilter === "featured" && !article.featured) return false;
        if (featuredFilter === "not-featured" && article.featured) return false;
        return true;
      })
      .sort((a, b) => {
        const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featuredDiff !== 0) return featuredDiff;
        return sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      });
  }, [
    articles,
    titleQuery,
    selectedCategories,
    minRating,
    dateFrom,
    dateTo,
    sortOrder,
    featuredFilter,
  ]);

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.articles.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">{t.articles.subtitle}</p>
      <TextLink to="/knowledge" className="mt-1 block text-sm">
        {t.knowledge.entryPointHint}
      </TextLink>

      <div className="relative mt-6 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          {t.common.filterSort}{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label={t.common.searchTitle}
                placeholder={t.common.titleKeywordPlaceholder}
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />

              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text)]">
                {t.articles.minRating}
                <select
                  value={minRating}
                  onChange={(event) => setMinRating(Number(event.target.value))}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-normal text-[var(--color-text)]"
                >
                  <option
                    value={0}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    {t.articles.unlimited}
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
                    4★{t.articles.andAbove}
                  </option>
                  <option
                    value={3}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    3★{t.articles.andAbove}
                  </option>
                  <option
                    value={2}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    2★{t.articles.andAbove}
                  </option>
                  <option
                    value={1}
                    className="bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    1★{t.articles.andAbove}
                  </option>
                </select>
              </label>

              <Input
                label={t.common.startDate}
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label={t.common.endDate}
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

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {t.common.featuredFilterLabel}
              </span>
              {(
                [
                  ["all", t.common.filterAll],
                  ["featured", t.common.filterFeatured],
                  ["not-featured", t.common.filterNotFeatured],
                ] as [FeaturedFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={featuredFilter === value}
                  onClick={() => setFeaturedFilter(value)}
                  className={[
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    featuredFilter === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">{t.common.sort}</span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                {t.common.newest}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                {t.common.oldest}
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t.articles.noMatch}
            description={t.articles.tryAdjustFilter}
          />
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {filteredArticles.map((article) => (
            <li key={article.slug}>
              <ArticleRow article={article} t={t} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
