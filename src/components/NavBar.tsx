import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "首頁" },
  { to: "/gallery", label: "藝術畫廊" },
  { to: "/about", label: "關於我" },
  { to: "/articles", label: "文章" },
  { to: "/projects", label: "專案" },
  { to: "/dreams", label: "夢想" },
  { to: "/friends", label: "朋友創作" },
  // todo: remove after development
  { to: "/dev/components", label: "組件預覽" },
];

export default function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex flex-wrap items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            isActive
              ? "font-semibold text-[var(--color-text)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }
        >
          {link.label}
        </NavLink>
      ))}
      <ThemeToggle />
    </nav>
  );
}
