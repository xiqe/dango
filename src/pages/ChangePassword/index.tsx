import { useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Button, Typography, Toast, Form } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import authStore from "@/stores/AuthStore";
import styles from "./password.module.css";

const { Title } = Typography;

const ChangePassword = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = useCallback(
    async (values: { newPassword: string; confirmPassword: string }) => {
      if (values.newPassword !== values.confirmPassword) {
        Toast.error(t("profile.passwordMismatch"));
        return;
      }

      setLoading(true);
      try {
        await authStore.updatePassword(values.newPassword);
        Toast.success(t("profile.passwordUpdateSuccess"));
        navigate("/profile");
      } catch (error) {
        Toast.error(t("profile.passwordUpdateError"));
      } finally {
        setLoading(false);
      }
    },
    [t, navigate]
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Title heading={3}>{t("profile.changePassword")}</Title>

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
          <div className={styles.actionButtons}>
            <Button type="tertiary" onClick={() => navigate("/profile")}>
              {t("common.cancel")}
            </Button>
            <Button htmlType="submit" type="primary" loading={loading}>
              {t("common.confirm")}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export default ChangePassword;
