import React, { useState, useCallback } from "react";
import { Card, Input, Button, Toast, Typography } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import authStore from "../../stores/AuthStore";
import styles from "./login.module.css";

const { Title } = Typography;

const Login = observer(() => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const toggleLoginRegister = useCallback(() => {
    setIsLogin((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !password) {
        Toast.error(
          t("login.errorMessages.emailRequired") +
            " " +
            t("login.errorMessages.passwordRequired")
        );
        return;
      }

      const success = isLogin
        ? await authStore.login(email, password)
        : await authStore.register(email, password);

      if (success) {
        Toast.success(
          isLogin
            ? t("login.successMessages.loginSuccess")
            : t("login.successMessages.registerSuccess")
        );
      } else {
        Toast.error(
          isLogin
            ? t("login.errorMessages.loginFailed")
            : t("login.errorMessages.registerFailed")
        );
      }
    },
    [email, password, isLogin, t]
  );

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title heading={3} className={styles.title}>
          {isLogin ? t("login.title.login") : t("login.title.register")}
        </Title>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            placeholder={t("login.placeholder.email")}
            value={email}
            onChange={setEmail}
            className={styles.input}
          />
          <Input
            type="password"
            placeholder={t("login.placeholder.password")}
            value={password}
            onChange={setPassword}
            className={styles.input}
          />
          <Button
            type="primary"
            htmlType="submit"
            block
            className={styles.button}
          >
            {isLogin ? t("login.button.login") : t("login.button.register")}
          </Button>
          <Button
            type="tertiary"
            block
            onClick={toggleLoginRegister}
            className={styles.switchButton}
          >
            {isLogin
              ? t("login.button.switchToRegister")
              : t("login.button.switchToLogin")}
          </Button>
        </form>
      </Card>
    </div>
  );
});

export default Login;
