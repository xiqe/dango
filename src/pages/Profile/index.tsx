import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  Button,
  Typography,
  Toast,
  Form,
  Modal,
} from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import authStore from "@/stores/AuthStore";
import styles from "./profile.module.css";

const { Text, Title } = Typography;

const Profile = observer(() => {
  const { t } = useTranslation();
  const { user } = authStore;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await authStore.logout();
      Toast.success(t("profile.logoutSuccess"));
    } catch (error) {
      Toast.error(t("profile.logoutError"));
    }
  };

  const handleUpdatePassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      Toast.error(t("profile.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await authStore.updatePassword(values.newPassword);
      Toast.success(t("profile.passwordUpdateSuccess"));
      setShowPasswordModal(false);
    } catch (error) {
      Toast.error(t("profile.passwordUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.userInfo}>
        <Title heading={3}>{t("profile.title")}</Title>
        <Text className={styles.email}>{user?.email}</Text>
      </Card>

      <div className={styles.actionSection}>
        <Button
          theme="solid"
          type="primary"
          className={styles.actionButton}
          onClick={() => setShowPasswordModal(true)}
        >
          {t("profile.changePassword")}
        </Button>

        <Button
          theme="solid"
          type="danger"
          className={styles.actionButton}
          onClick={handleLogout}
        >
          {t("profile.logoutButton")}
        </Button>
      </div>

      <Text className={styles.version}>Version 1.0.0</Text>

      <Modal
        title={t("profile.changePassword")}
        visible={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        footer={null}
      >
        <Form onSubmit={handleUpdatePassword}>
          <Form.Input
            field="newPassword"
            label={t("profile.newPassword")}
            type="password"
            rules={[
              { required: true, message: t("profile.passwordRequired") },
              { min: 6, message: t("profile.passwordMinLength") },
            ]}
          />
          <Form.Input
            field="confirmPassword"
            label={t("profile.confirmPassword")}
            type="password"
            rules={[
              { required: true, message: t("profile.confirmPasswordRequired") },
            ]}
          />
          <div className={styles.modalFooter}>
            <Button type="tertiary" onClick={() => setShowPasswordModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button htmlType="submit" type="primary" loading={loading}>
              {t("common.confirm")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
});

export default Profile;
