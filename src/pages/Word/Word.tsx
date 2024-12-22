import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Space, Typography } from "@douyinfe/semi-ui";
import { IWord } from "@/services/types";
import { getWords, addWord, deleteWord } from "@/services/firebase/words";
import { observer } from "mobx-react-lite";
import authStore from "@/stores/AuthStore";
import styles from "./word.module.css";

const { Text, Title } = Typography;

const Word = observer(() => {
  const { t } = useTranslation();
  const [words, setWords] = useState<IWord[]>([]);
  const [japanese, setJapanese] = useState("");
  const [chinese, setChinese] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const [deletingWordIds, setDeletingWordIds] = useState<Set<string>>(
    new Set()
  );

  const loadWords = useCallback(async () => {
    if (!authStore.user?.uid) return;
    try {
      const fetchedWords = await getWords(authStore.user.uid);
      setWords(fetchedWords);
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setLoading(false);
    }
  }, [authStore.user?.uid]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

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
        await loadWords();
        setJapanese("");
        setChinese("");
      } catch (error) {
        console.error("Error adding word:", error);
      } finally {
        setAddingWord(false);
      }
    },
    [japanese, chinese, authStore.user?.uid, loadWords, addingWord]
  );

  const handleDelete = useCallback(
    async (wordId: string) => {
      if (!authStore.user?.uid || deletingWordIds.has(wordId)) return;

      setDeletingWordIds((prev) => new Set([...prev, wordId]));
      try {
        await deleteWord(authStore.user.uid, wordId);
        await loadWords();
      } catch (error) {
        console.error("Error deleting word:", error);
      } finally {
        setDeletingWordIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(wordId);
          return newSet;
        });
      }
    },
    [authStore.user?.uid, loadWords, deletingWordIds]
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
      <div className={styles.card}>
        <h2 className={styles.listTitle}>{t("addWord.listTitle")}</h2>
        <Space vertical align="start" style={{ width: "100%" }}>
          {loading ? (
            <Text type="tertiary">{t("common.loading")}</Text>
          ) : words.length === 0 ? (
            <Text type="tertiary">{t("addWord.emptyList")}</Text>
          ) : (
            [...words]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((word) => (
                <div key={word.id} className={styles.wordCard}>
                  <div className={styles.wordCardContent}>
                    <Space vertical align="start">
                      <Title heading={5}>{word.japanese}</Title>
                      <Text>{word.chinese}</Text>
                      <Text type="tertiary" size="small">
                        {t("addWord.nextReview", {
                          date: new Date(
                            word.nextReviewDate
                          ).toLocaleDateString(),
                        })}
                      </Text>
                    </Space>
                    <Button
                      type="danger"
                      theme="borderless"
                      className={styles.remove}
                      onClick={() => handleDelete(word.id)}
                      loading={deletingWordIds.has(word.id)}
                    >
                      {t("common.deleteButton")}
                    </Button>
                  </div>
                </div>
              ))
          )}
        </Space>
      </div>
    </div>
  );
});

export default Word;
