import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Button, Typography, Toast } from "@douyinfe/semi-ui";
import authStore from "@/stores/AuthStore";
import { sendEmailVerification } from "@/services/firebase/auth";
import styles from "./verfication.module.css";

const EmailVerification = observer(() => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);

  const handleSendVerification = async () => {
    if (!authStore.user) return;

    setSending(true);
    try {
      await sendEmailVerification(authStore.user);
      Toast.success(t("verification.emailSentSuccess"));
    } catch (error) {
      Toast.error(t("verification.emailSentError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className={styles.title}>{t("verification.title")}</h2>
        <Typography.Paragraph>
          {t("verification.description")}
        </Typography.Paragraph>
        <div className={styles.actionButtons}>
          <Button
            theme="solid"
            type="primary"
            size="large"
            className={styles.button}
            loading={sending}
            onClick={handleSendVerification}
          >
            {t("verification.resendButton")}
          </Button>

          <Button
            theme="solid"
            type="tertiary"
            size="large"
            onClick={() => authStore.logout()}
          >
            {t("profile.logoutButton")}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default EmailVerification;
