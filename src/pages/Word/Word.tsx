import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Space, Typography, Input } from "@douyinfe/semi-ui";
import { Search } from "@/assets/index";
import { IWord } from "@/services/types";
import { getWords } from "@/services/firebase/words";
import { observer } from "mobx-react-lite";
import authStore from "@/stores/AuthStore";
import { useNavigate } from "react-router-dom";
import styles from "./word.module.css";

const { Text, Title } = Typography;

const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
};

const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
};

const SIMILARITY_THRESHOLD = 0.3;

const Word = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [words, setWords] = useState<IWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredWords = useMemo(() => {
    if (!searchTerm) return words;

    return words
      .map((word) => {
        const japaneseSimilarity = calculateSimilarity(
          word.japanese,
          searchTerm
        );
        const chineseSimilarity = calculateSimilarity(word.chinese, searchTerm);
        const maxSimilarity = Math.max(japaneseSimilarity, chineseSimilarity);

        return {
          ...word,
          similarity: maxSimilarity,
        };
      })
      .filter((word) => word.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity);
  }, [words, searchTerm]);

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
          {loading ? (
            <Text type="tertiary">{t("common.loading")}</Text>
          ) : filteredWords.length === 0 ? (
            <Text type="tertiary">
              {searchTerm
                ? t("addWord.noSearchResults")
                : t("addWord.emptyList")}
            </Text>
          ) : (
            filteredWords.map((word) => (
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
