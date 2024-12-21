import React, { useState } from "react";
import { Card, Input, Button, Toast, Typography } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import authStore from "../../stores/AuthStore";
import styles from "./login.module.css";

const { Title } = Typography;

const Login = observer(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      Toast.error("メールアドレスとパスワードを入力してください。");
      return;
    }

    const success = isLogin
      ? await authStore.login(email, password)
      : await authStore.register(email, password);

    if (success) {
      Toast.success(isLogin ? "ログインしました" : "登録しました");
    } else {
      Toast.error(isLogin ? "ログインに失敗しました" : "登録に失敗しました");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title heading={3} className={styles.title}>
          {isLogin ? "ログイン" : "新規登録"}
        </Title>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={setEmail}
            className={styles.input}
          />
          <Input
            type="password"
            placeholder="パスワード"
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
            {isLogin ? "ログイン" : "登録"}
          </Button>
          <Button
            type="tertiary"
            block
            onClick={() => setIsLogin(!isLogin)}
            className={styles.switchButton}
          >
            {isLogin ? "新規登録へ" : "ログインへ"}
          </Button>
        </form>
      </Card>
    </div>
  );
});

export default Login;
