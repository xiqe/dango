import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { Add, Word, Test, Setting, Practise } from "@/assets/index";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import groupStore from "@/stores/GroupStore";
import styles from "./layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = observer(({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (authStore.user) {
      // 使用实时监听订阅数据，自动利用缓存
      wordStore.subscribeWords();
      groupStore.subscribeGroups();
    }

    // 清理函数：用户登出时取消订阅
    return () => {
      wordStore.unsubscribeWords();
      groupStore.unsubscribeGroups();
    };
  }, [authStore.user]);

  const menus = [
    { key: "/", text: t("nav.task"), icon: <Test className={styles.icon} /> },
    {
      key: "/practise",
      text: t("nav.practise"),
      icon: <Practise className={styles.icon} />,
    },
    {
      key: "/add",
      text: t("nav.add"),
      icon: <Add className={styles.icon} />,
    },
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
            <div className={styles.title}>{menu.text}</div>
          </div>
        ))}
      </nav>
    </div>
  );
});

export default Layout;
