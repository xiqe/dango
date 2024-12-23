import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import cls from "clsx";
import { Button, Typography } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { IWord } from "@/services/types";
import { updateWordProgress } from "@/services/firebase/words";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import styles from "./review.module.css";

const { Text, Title } = Typography;

const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

interface ReviewState {
  word: IWord;
  isJapaneseQuestion: boolean;
}

const Review = observer(() => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomReviewState = (word: IWord): ReviewState => {
    return {
      word,
      isJapaneseQuestion: Math.random() < 0.5,
    };
  };

  useEffect(() => {
    const updateVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    window.addEventListener("resize", updateVH);
    updateVH();

    return () => window.removeEventListener("resize", updateVH);
  }, []);

  useEffect(() => {
    const reviewWords = wordStore.words.filter(
      (word) => word.nextReviewDate <= Date.now()
    );
    setCurrentReview(
      reviewWords[0] ? getRandomReviewState(reviewWords[0]) : null
    );
  }, [wordStore.words]);

  const handleReview = useCallback(
    async (remembered: boolean) => {
      if (currentReview) {
        setIsLoading(true);
        const updatedWords = wordStore.words.map((word) => {
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

          wordStore.updateWords(updatedWords);
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
    [currentReview]
  );

  const progress = wordStore.reviewProgress;
  const todayWords = wordStore.todayWords;

  return (
    <div className="container">
      <div className="card">
        <div className={styles.header}>
          <div className={styles.box}>
            <div className={styles.boxTitle}>{t("review.todayReview")}</div>
            <div className={cls(styles.num, styles.today)}>{todayWords}</div>
          </div>
          <div className={styles.box}>
            <div className={styles.boxTitle}>{t("review.correctRate")}</div>
            <div className={styles.percent}>
              {progress.correctRate.toFixed(1)}%
            </div>
            <div className={styles.boxTitle}>{t("review.totalReviews")}</div>
            <div className={styles.percent}>{progress.totalReviews}</div>
          </div>
          <div className={styles.box}>
            <div className={styles.boxTitle}>{t("review.totalWords")}</div>
            <div className={styles.num}>{wordStore.words.length}</div>
          </div>
        </div>

        <div className={styles.reviewArea}>
          {currentReview ? (
            <div className={styles.wordCard}>
              <div className={styles.statistics}>
                <div>
                  {t("review.accuracy")}：
                  <span>
                    {currentReview.word.reviewCount === 0
                      ? "0"
                      : (
                          (currentReview.word.correctCount /
                            currentReview.word.reviewCount) *
                          100
                        ).toFixed(1)}
                    %
                  </span>
                </div>
                <div>
                  {t("review.memoryLevel")}：
                  <span>{currentReview?.word.correctCount}</span>
                </div>
              </div>

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
                      className={styles.button2}
                      onClick={() => handleReview(false)}
                      loading={isLoading}
                    >
                      {t("review.forgotten")}
                    </Button>
                    <Button
                      theme="solid"
                      size="large"
                      className={styles.button}
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
      </div>
    </div>
  );
});

export default Review;
