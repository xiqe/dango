import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Space, Typography } from "@douyinfe/semi-ui";
import { IWord } from "@/services/types";
import { addWord } from "@/services/firebase/words";
import { observer } from "mobx-react-lite";
import authStore from "@/stores/AuthStore";
import styles from "./add.module.css";

const { Text } = Typography;

const Add = observer(() => {
  const { t } = useTranslation();
  const [japanese, setJapanese] = useState("");
  const [chinese, setChinese] = useState("");
  const [addingWord, setAddingWord] = useState(false);

  const handleAddWord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !authStore.user?.uid ||
        !japanese.trim() ||
        !chinese.trim() ||
        addingWord
      )
        return;

      setAddingWord(true);
      try {
        const newWord: Omit<IWord, "id"> = {
          japanese: japanese.trim(),
          chinese: chinese.trim(),
          createdAt: Date.now(),
          nextReviewDate: Date.now(),
          reviewCount: 0,
          correctCount: 0,
          stage: 0,
        };

        await addWord(authStore.user.uid, newWord);
        setJapanese("");
        setChinese("");
      } catch (error) {
        console.error("Error adding word:", error);
      } finally {
        setAddingWord(false);
      }
    },
    [japanese, chinese, authStore.user?.uid, addingWord]
  );

  if (!authStore.user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Text>{t("common.pleaseLogin")}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t("nav.add")}</h2>
        <Space
          vertical
          align="start"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <form onSubmit={handleAddWord} className={styles.form}>
            <Space
              vertical
              align="start"
              spacing="medium"
              style={{ width: "100%" }}
            >
              <Input
                value={japanese}
                onChange={(value) => setJapanese(value)}
                placeholder={t("common.japanese")}
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Input
                value={chinese}
                onChange={(value) => setChinese(value)}
                placeholder={t("common.chinese")}
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Button
                type="primary"
                htmlType="submit"
                theme="solid"
                size="large"
                className={styles.submitButton}
                loading={addingWord}
              >
                {t("common.addButton")}
              </Button>
            </Space>
          </form>
        </Space>
      </div>
    </div>
  );
});
export default Add;
