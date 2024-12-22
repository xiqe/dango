import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Add, Word, Test, Setting } from "@/assets/index";
import styles from "./layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menus = [
    { key: "/", text: t("nav.task"), icon: <Test className={styles.icon} /> },
    {
      key: "/word",
      text: t("nav.wordlist"),
      icon: <Word className={styles.icon} />,
    },
    {
      key: "/profile",
      text: t("nav.profile"),
      icon: <Setting className={styles.icon} />,
    },
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
            {menu.icon}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
