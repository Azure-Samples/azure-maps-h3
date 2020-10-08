import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import styles from "./Header.module.scss";

interface Page {
  title: string | JSX.Element;
  href: string;
  children?: Page[]; //currently no use -- @TODO will we need a dropdown tree for child pages?
}

interface HeaderProps {
  pages: Page[];
}

/**
 * Generates a header link ready to be placed in the <Header>.
 * Generates Next <Link> if the href is in the same domain.
 * Generates <a> if the href is external.
 *
 * @param page to generate a link for
 */
const HeaderLink: FunctionComponent<Page> = ({ title, href }: Page) => {
  const isExternal = href.includes("://");
  const link = isExternal ? (
    <a href={href} target="_blank" rel="noreferrer">
      {title}
    </a>
  ) : (
    <Link href={href}>
      <a>{title}</a>
    </Link>
  );

  const router = useRouter();
  const isSelected = router.pathname === href;
  const className = isSelected
    ? styles["header__item--selected"]
    : styles.header__item;
  return (
    <div className={className} key={href}>
      {link}
    </div>
  );
};

/**
 * Header component to be used as the consistent header for the site
 *
 * @param props
 */
export const Header: FunctionComponent<HeaderProps> = (props) => {
  const links = props.pages.map(HeaderLink);
  return (
    <>
      <header className={styles.header}>
        <div className={styles.header__section}>{links}</div>
        <div className={styles.header__section}>
          <div className={styles.header__item}>Azure Maps H3 Sample</div>
        </div>
      </header>
    </>
  );
};
