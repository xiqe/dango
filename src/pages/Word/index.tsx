import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Card, Space, Typography } from "@douyinfe/semi-ui";

const { Text, Title } = Typography;

interface IWord {
  id: string;
  japanese: string;
  chinese: string;
  createdAt: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  stage: number;
}

const Word = () => {
  const { t } = useTranslation();
  const [words, setWords] = useState<IWord[]>([]);
  const [japanese, setJapanese] = useState("");
  const [chinese, setChinese] = useState("");

  useEffect(() => {
    const savedWords = localStorage.getItem("words");
    if (savedWords) {
      setWords(JSON.parse(savedWords));
    }
  }, []);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (japanese.trim() && chinese.trim()) {
      const newWord: IWord = {
        id: Date.now().toString(),
        japanese: japanese.trim(),
        chinese: chinese.trim(),
        createdAt: Date.now(),
        nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // 1天后复习
        reviewCount: 0,
        correctCount: 0,
        stage: 0,
      };

      const updatedWords = [...words, newWord];
      localStorage.setItem("words", JSON.stringify(updatedWords));
      setWords(updatedWords);
      setJapanese("");
      setChinese("");
    }
  };

  const handleDelete = (wordId: string) => {
    const updatedWords = words.filter((word) => word.id !== wordId);
    localStorage.setItem("words", JSON.stringify(updatedWords));
    setWords(updatedWords);
  };

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
              {words.length === 0 ? (
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
};

export default Word;
