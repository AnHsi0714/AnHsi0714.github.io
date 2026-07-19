import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./TextLink.module.scss";

interface InternalTextLinkProps {
  to: string;
  href?: undefined;
  className?: string;
  children: ReactNode;
}

interface ExternalTextLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> {
  to?: undefined;
  href: string;
  className?: string;
  children: ReactNode;
}

type TextLinkProps = InternalTextLinkProps | ExternalTextLinkProps;

export default function TextLink(props: TextLinkProps) {
  const classNames = [styles.link, props.className].filter(Boolean).join(" ");

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classNames}>
        {props.children}
      </Link>
    );
  }

  const { href, children, className: _className, to: _to, ...rest } = props;
  const isMailto = href.startsWith("mailto:");

  return (
    <a
      href={href}
      className={classNames}
      target={isMailto ? undefined : "_blank"}
      rel={isMailto ? undefined : "noreferrer"}
      {...rest}
    >
      {children}
    </a>
  );
}
