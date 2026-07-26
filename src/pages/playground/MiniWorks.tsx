import { Link } from "react-router-dom";
import Card from "../../components/Card";
import TextLink from "../../components/TextLink";
import { useTranslation } from "../../i18n/useTranslation";

export default function MiniWorks() {
  const { t } = useTranslation();

  const links = [
    {
      to: "/playground/mini-works/namecard",
      label: t.playground.miniWorks.nameCardLabel,
      desc: t.playground.miniWorks.nameCardDesc,
    },
  ];

  return (
    <section>
      <TextLink to="/playground" restoreScroll className="text-sm font-medium">
        {t.playground.miniWorks.backToPlayground}
      </TextLink>

      <h1 className="mt-4 text-2xl font-bold">{t.playground.miniWorks.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        {t.playground.miniWorks.subtitle}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card hoverable>
              <p className="font-semibold">{link.label}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {link.desc}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
