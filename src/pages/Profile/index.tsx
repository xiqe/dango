import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Button, Typography, Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import authStore from "@/stores/AuthStore";
import styles from "./profile.module.css";

const { Text, Title } = Typography;

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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Title heading={3}>{t("profile.title")}</Title>
        <Text className={styles.email}>{user?.email}</Text>

        <div className={styles.actionSection}>
          <Button
            theme="solid"
            type="primary"
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
