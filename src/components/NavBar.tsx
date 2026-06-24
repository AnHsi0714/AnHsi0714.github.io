import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "首頁" },
  { to: "/gallery", label: "藝術畫廊" },
  { to: "/life", label: "人生" },
  { to: "/articles", label: "文章" },
  { to: "/projects", label: "專案" },
  { to: "/dreams", label: "夢想" },
  { to: "/friends", label: "朋友創作" },
  // todo: remove after development
  { to: "/dev/components", label: "組件預覽" },
];

export default function NavBar() {
  return (
    <nav className="flex flex-wrap gap-4 border-b border-neutral-200 px-4 py-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            isActive
              ? "font-semibold text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900"
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
