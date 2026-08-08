import { useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import TextLink from "../../components/TextLink";
import { useTranslation } from "../../i18n/useTranslation";
import { miniWorkBySlug } from "./miniWorksRegistry";

export default function MiniWorkDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const work = miniWorkBySlug(slug);

  if (!work) {
    return (
      <section>
        <EmptyState
          title={t.playground.miniWorks.notFoundTitle}
          description={t.playground.miniWorks.notFoundDesc}
        />
        <TextLink
          to="/playground/mini-works"
          restoreScroll
          className="mt-4 inline-block text-sm font-medium"
        >
          {t.playground.miniWorks.backToList}
        </TextLink>
      </section>
    );
  }

  const Page = work.Component;
  return <Page />;
}
