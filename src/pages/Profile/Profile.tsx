import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Button, Typography, Toast, Tag } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import styles from "./profile.module.css";

const { Title } = Typography;

const Profile = observer(() => {
  const { t } = useTranslation();
  const { user } = authStore;
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await authStore.logout();
      Toast.success(t("profile.logoutSuccess"));
    } catch (error) {
      Toast.error(t("profile.logoutError"));
    }
  }, [t]);

  const handleExportWords = useCallback(() => {
    try {
      // Extract only japanese and chinese properties
      const wordsToExport = wordStore.words.map(({ japanese, chinese }) => ({
        japanese,
        chinese,
      }));

      // Create blob and download link
      const jsonString = JSON.stringify(wordsToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create and trigger download
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      link.download = `vocabulary_${date}.json`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      Toast.error(t("common.exportError"));
    }
  }, [t]);

  return (
    <div className="container">
      <div className="card">
        <Title heading={3}>{t("profile.title")}</Title>
        <div className={styles.email}>{user?.email}</div>
        {user?.emailVerified && (
          <Tag color="green" type="light">
            {t("profile.verified")}
          </Tag>
        )}

        <div className={styles.actionSection}>
          <Button
            theme="solid"
            type="secondary"
            size="large"
            className={styles.actionButton}
            onClick={handleExportWords}
          >
            {t("common.export")}
          </Button>

          <Button
            theme="solid"
            type="secondary"
            size="large"
            className={styles.actionButton}
            onClick={() => navigate("/change-password")}
          >
            {t("profile.changePassword")}
          </Button>

          <Button
            theme="solid"
            type="tertiary"
            size="large"
            onClick={handleLogout}
          >
            {t("profile.logoutButton")}
          </Button>
        </div>

        <div className={styles.version}>Version 1.0.0</div>
      </div>
    </div>
  );
});

export default Profile;
