import { Link } from "react-router-dom";
import Card from "../../components/Card";
import { useTranslation } from "../../i18n/useTranslation";

export default function Playground() {
  const { t } = useTranslation();

  const links = [
    { to: "/dreams", label: t.nav.dreams, desc: t.playground.dreamsDesc },
    { to: "/friends", label: t.nav.friends, desc: t.playground.friendsDesc },
    {
      to: "/dev/components",
      label: t.nav.devComponents,
      desc: t.playground.devComponentsDesc,
    },
    {
      to: "/dev/creature",
      label: t.nav.devCreature,
      desc: t.playground.devCreatureDesc,
    },
    {
      to: "/dev/creature-builder",
      label: t.nav.devCreatureBuilder,
      desc: t.playground.devCreatureBuilderDesc,
    },
  ];

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.playground.title}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        {t.playground.subtitle}
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
