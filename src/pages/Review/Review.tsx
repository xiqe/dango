import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, Space, Progress } from "@douyinfe/semi-ui";
import { IWord } from "@/services/types";
import { getWords, updateWordProgress } from "@/services/firebase/words";
import authStore from "@/stores/AuthStore";
import styles from "./review.module.css";

const { Text, Title } = Typography;

const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

interface ReviewState {
  word: IWord;
  isJapaneseQuestion: boolean;
}

const Review = () => {
  const { t } = useTranslation();
  const [words, setWords] = useState<IWord[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomReviewState = (word: IWord): ReviewState => {
    return {
      word,
      isJapaneseQuestion: Math.random() < 0.5,
    };
  };

  const loadWords = useCallback(async () => {
    if (!authStore.user?.uid) return;
    try {
      const fetchedWords = await getWords(authStore.user.uid);
      setWords(fetchedWords);
      const reviewWords = fetchedWords.filter(
        (word: IWord) => word.nextReviewDate <= Date.now()
      );
      setCurrentReview(
        reviewWords[0] ? getRandomReviewState(reviewWords[0]) : null
      );
    } catch (error) {
      console.error("Error loading words from Firestore:", error);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleReview = useCallback(
    async (remembered: boolean) => {
      if (currentReview) {
        setIsLoading(true);
        const updatedWords = words.map((word) => {
          if (word.id === currentReview.word.id) {
            const newStage = remembered
              ? Math.min(word.stage + 1, REVIEW_INTERVALS.length - 1)
              : Math.max(0, word.stage - 1);

            return {
              ...word,
              reviewCount: word.reviewCount + 1,
              correctCount: remembered
                ? word.correctCount + 1
                : word.correctCount,
              stage: newStage,
              nextReviewDate:
                Date.now() + REVIEW_INTERVALS[newStage] * 24 * 60 * 60 * 1000,
            };
          }
          return word;
        });

        try {
          if (!authStore.user?.uid) return;
          await updateWordProgress(authStore.user?.uid, currentReview.word.id, {
            reviewCount: currentReview.word.reviewCount + 1,
            correctCount: remembered
              ? currentReview.word.correctCount + 1
              : currentReview.word.correctCount,
            stage: remembered
              ? Math.min(
                  currentReview.word.stage + 1,
                  REVIEW_INTERVALS.length - 1
                )
              : Math.max(0, currentReview.word.stage - 1),
            nextReviewDate:
              Date.now() +
              REVIEW_INTERVALS[
                remembered
                  ? Math.min(
                      currentReview.word.stage + 1,
                      REVIEW_INTERVALS.length - 1
                    )
                  : Math.max(0, currentReview.word.stage - 1)
              ] *
                24 *
                60 *
                60 *
                1000,
          });

          setWords(updatedWords);
          const remainingWords = updatedWords.filter(
            (word) => word.nextReviewDate <= Date.now()
          );
          setCurrentReview(
            remainingWords[0] ? getRandomReviewState(remainingWords[0]) : null
          );
          setShowAnswer(false);
        } catch (error) {
          console.error("Error updating word progress in Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [currentReview, words]
  );

  const getProgress = useCallback(() => {
    const totalReviews = words.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = words.reduce(
      (sum, word) => sum + word.correctCount,
      0
    );
    const correctRate =
      totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    return { correctRate, totalReviews };
  }, [words]);

  const progress = getProgress();
  const todayWords = words.filter(
    (word) => word.nextReviewDate <= Date.now()
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Space
          vertical
          align="center"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <div className={styles.header}>
            <Text>{t("review.todayReview", { count: todayWords })}</Text>
          </div>

          <div className={styles.content}>
            <Progress
              percent={progress.correctRate}
              showInfo
              format={(percent) =>
                t("review.correctRate", { rate: percent.toFixed(1) })
              }
            />
            <Text type="secondary">
              {t("review.totalReviews", { count: progress.totalReviews })}
            </Text>
          </div>

          <div className={styles.reviewArea}>
            {currentReview ? (
              <div className={styles.wordCard}>
                <Title heading={4} className={styles.question}>
                  {currentReview.isJapaneseQuestion
                    ? currentReview.word.japanese
                    : currentReview.word.chinese}
                </Title>
                {showAnswer ? (
                  <>
                    <Title heading={4} className={styles.answer}>
                      {currentReview.isJapaneseQuestion
                        ? currentReview.word.chinese
                        : currentReview.word.japanese}
                    </Title>
                    <div className={styles.cardFoot}>
                      <Button
                        theme="solid"
                        size="large"
                        className={styles.button}
                        onClick={() => handleReview(false)}
                        loading={isLoading}
                      >
                        {t("review.forgotten")}
                      </Button>
                      <Button
                        theme="solid"
                        size="large"
                        className={styles.button2}
                        onClick={() => handleReview(true)}
                        loading={isLoading}
                      >
                        {t("review.remembered")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={styles.cardFoot}>
                    <Button
                      type="primary"
                      theme="solid"
                      size="large"
                      className={styles.button}
                      onClick={() => setShowAnswer(true)}
                    >
                      {t("review.showAnswer")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.completedMessage}>
                <Text type="secondary" size="normal">
                  {t("review.completed")}
                </Text>
              </div>
            )}
          </div>
        </Space>
      </div>
    </div>
  );
};

export default Review;