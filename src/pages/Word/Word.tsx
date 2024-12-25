import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import cls from "clsx";
import { Button, Space, Typography, Input } from "@douyinfe/semi-ui";
import { Search } from "@/assets/index";
import { observer } from "mobx-react-lite";
import { Voice } from "@/assets/index";
import { useSpeech } from "@/hooks";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import { useNavigate } from "react-router-dom";
import styles from "./word.module.css";

const { Text, Title } = Typography;

const Word = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const handleSpeak = useSpeech();

  const filteredAndSortedWords = useMemo(() => {
    let words = wordStore.words;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      words = words.filter(
        (word) =>
          word.japanese.toLowerCase().includes(lowerSearchTerm) ||
          word.chinese.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return [...words].sort((a, b) => {
      if (a.stage !== b.stage) {
        return a.stage - b.stage;
      }
      const errorCountA = a.reviewCount - a.correctCount;
      const errorCountB = b.reviewCount - b.correctCount;
      return errorCountB - errorCountA;
    });
  }, [wordStore.words, searchTerm]);

  if (!authStore.user) {
    return (
      <div className="container">
        <div className="card">
          <Text>{t("common.pleaseLogin")}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={cls("container", styles.list)}>
      <div className="card">
        <h2 className={styles.title}>{t("addWord.listTitle")}</h2>
        <div className={styles.searchContainer}>
          <Input
            prefix={<Search className={styles.icon} />}
            placeholder={t("common.search")}
            size="large"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            style={{ marginBottom: 16 }}
          />
        </div>
        <Space vertical align="start" style={{ width: "100%" }}>
          {wordStore.loading ? (
            <Text type="tertiary">{t("common.loading")}</Text>
          ) : filteredAndSortedWords.length === 0 ? (
            <Text type="tertiary">
              {searchTerm
                ? t("addWord.noSearchResults")
                : t("addWord.emptyList")}
            </Text>
          ) : (
            filteredAndSortedWords.map((word) => (
              <div key={word.id} className={styles.wordCard}>
                <div className={styles.wordCardContent}>
                  <Space vertical align="start">
                    <div>
                      <Title heading={5} className={styles.title}>
                        {word.japanese}{" "}
                        <span className={styles.stage}>{word.stage}</span>
                      </Title>
                    </div>
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
                    type="tertiary"
                    size="small"
                    className={styles.voice}
                    icon={<Voice className={styles.icon} />}
                    onClick={(e) => handleSpeak(word.japanese, e)}
                    style={{ marginLeft: 8 }}
                  />

                  <Button
                    type="primary"
                    theme="borderless"
                    className={styles.remove}
                    onClick={() => navigate(`/word/${word.id}`)}
                  >
                    {t("common.details")}
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