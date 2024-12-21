import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menus = [
    { key: "/", text: t("nav.task") },
    { key: "/word", text: t("nav.wordlist") },
    { key: "/profile", text: t("nav.profile") },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.content}>{children}</main>
      <nav className={styles.nav}>
        {menus.map((menu) => (
          <div
            key={menu.key}
            className={`${styles.navItem} ${
              location.pathname === menu.key ? styles.active : ""
            }`}
            onClick={() => navigate(menu.key)}
          >
            {menu.text}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
