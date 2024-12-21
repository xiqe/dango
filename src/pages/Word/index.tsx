import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Card, Space, Typography } from "@douyinfe/semi-ui";
import { IWord } from "@/services/types";
import { getWords, addWord, deleteWord } from "@/services/firebase/words";
import { observer } from "mobx-react-lite";
import authStore from "@/stores/AuthStore";

const { Text, Title } = Typography;

const Word = observer(() => {
  const { t } = useTranslation();
  const [words, setWords] = useState<IWord[]>([]);
  const [japanese, setJapanese] = useState("");
  const [chinese, setChinese] = useState("");
  const [loading, setLoading] = useState(true);

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
      if (!authStore.user?.uid || !japanese.trim() || !chinese.trim()) return;

      try {
        const newWord: Omit<IWord, "id"> = {
          japanese: japanese.trim(),
          chinese: chinese.trim(),
          createdAt: Date.now(),
          nextReviewDate: Date.now(), // 当天
          reviewCount: 0,
          correctCount: 0,
          stage: 0,
        };

        await addWord(authStore.user.uid, newWord);
        await loadWords(); // Reload words after adding
        setJapanese("");
        setChinese("");
      } catch (error) {
        console.error("Error adding word:", error);
      }
    },
    [japanese, chinese, authStore.user?.uid, loadWords]
  );

  const handleDelete = useCallback(
    async (wordId: string) => {
      if (!authStore.user?.uid) return;
      try {
        await deleteWord(authStore.user.uid, wordId);
        await loadWords();
      } catch (error) {
        console.error("Error deleting word:", error);
      }
    },
    [authStore.user?.uid, loadWords]
  );

  if (!authStore.user) {
    return (
      <div className="container safe-area-inset-bottom">
        <Card className="mt-lg">
          <Text>{t("common.pleaseLogin")}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="container safe-area-inset-bottom">
      <Card className="mt-lg">
        <Space
          vertical
          align="start"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <form onSubmit={handleAddWord} style={{ width: "100%" }}>
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
                style={{ width: "100%" }}
                showClear
              />
              <Input
                value={chinese}
                onChange={(value) => setChinese(value)}
                placeholder={t("common.chinese")}
                style={{ width: "100%" }}
                showClear
              />
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                {t("common.addButton")}
              </Button>
            </Space>
          </form>

          <div style={{ width: "100%", marginTop: "32px" }}>
            <Title heading={4} style={{ marginBottom: "16px" }}>
              {t("addWord.listTitle")}
            </Title>
            <Space vertical align="start" style={{ width: "100%" }}>
              {loading ? (
                <Text type="tertiary">{t("common.loading")}</Text>
              ) : words.length === 0 ? (
                <Text type="tertiary">{t("addWord.emptyList")}</Text>
              ) : (
                [...words]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((word) => (
                    <Card
                      key={word.id}
                      style={{ width: "100%" }}
                      bodyStyle={{ padding: "12px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
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
                          onClick={() => handleDelete(word.id)}
                        >
                          {t("common.deleteButton")}
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
});

export default Word;
