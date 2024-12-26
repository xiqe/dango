import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import cls from "clsx";
import { Button, Typography, Tag } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { IWord } from "@/services/types";
import { updateWordProgress } from "@/services/firebase/words";
import { ProgressRing } from "@/components";
import { useSpeech } from "@/hooks";
import { getEndOfDay } from "@/utils";
import { Voice } from "@/assets/index";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import groupStore from "@/stores/GroupStore";
import styles from "./review.module.css";

const { Text, Title } = Typography;

const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];
const COMPLETED_STAGE = 7;

interface ReviewState {
  word: IWord;
  isJapaneseQuestion: boolean;
}

const getNextReviewDate = (stage: number) => {
  if (stage === COMPLETED_STAGE) return Infinity;

  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + REVIEW_INTERVALS[stage]
  ).getTime();
};

const Review = observer(() => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSpeak = useSpeech();

  const getRandomReviewState = (word: IWord): ReviewState => {
    return {
      word,
      isJapaneseQuestion: Math.random() < 0.5,
    };
  };

  useEffect(() => {
    const endOfToday = getEndOfDay();
    const reviewWords = wordStore.words.filter(
      (word) => word.nextReviewDate <= endOfToday
    );
    setCurrentReview(
      reviewWords[0] ? getRandomReviewState(reviewWords[0]) : null
    );
  }, [wordStore.words]);

  const getGroupName = useCallback(
    (groupId: string | undefined) => {
      if (!groupId) return t("common.all");
      const group = groupStore.groups.find((g) => g.id === groupId);
      return group ? group.name : t("common.all");
    },
    [groupStore.groups, t]
  );

  const handleReview = useCallback(
    async (remembered: boolean) => {
      if (currentReview) {
        setIsLoading(true);
        const updatedWords = wordStore.words.map((word) => {
          if (word.id === currentReview.word.id) {
            let newStage;
            if (remembered) {
              if (word.stage === REVIEW_INTERVALS.length - 1) {
                newStage = COMPLETED_STAGE;
              } else {
                newStage = Math.min(
                  word.stage + 1,
                  REVIEW_INTERVALS.length - 1
                );
              }
            } else {
              newStage = Math.max(0, word.stage - 1);
            }

            return {
              ...word,
              reviewCount: word.reviewCount + 1,
              correctCount: remembered
                ? word.correctCount + 1
                : word.correctCount,
              stage: newStage,
              nextReviewDate: getNextReviewDate(newStage),
            };
          }
          return word;
        });

        try {
          if (!authStore.user?.uid) return;
          const currentWord = currentReview.word;
          let newStage;
          if (remembered) {
            if (currentWord.stage === REVIEW_INTERVALS.length - 1) {
              newStage = COMPLETED_STAGE;
            } else {
              newStage = Math.min(
                currentWord.stage + 1,
                REVIEW_INTERVALS.length - 1
              );
            }
          } else {
            newStage = Math.max(0, currentWord.stage - 1);
          }

          await updateWordProgress(authStore.user?.uid, currentReview.word.id, {
            reviewCount: currentReview.word.reviewCount + 1,
            correctCount: remembered
              ? currentReview.word.correctCount + 1
              : currentReview.word.correctCount,
            stage: newStage,
            nextReviewDate: getNextReviewDate(newStage),
          });

          wordStore.updateWords(updatedWords);
          const endOfToday = getEndOfDay();
          const remainingWords = updatedWords.filter(
            (word) => word.nextReviewDate <= endOfToday
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
            <div className={styles.boxTitle}>{t("review.completedWords")}</div>
            <div className={cls(styles.num)}>
              {wordStore.completedWordsCount}
            </div>
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
                <div className={styles.left}>
                  <div className={styles.groupInfo}>
                    <Tag color="blue" size="large">
                      {getGroupName(currentReview.word.groupId)}
                    </Tag>
                  </div>
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
                <ProgressRing stage={currentReview?.word.stage} size={48} />
              </div>

              <div className={styles.questionWrapper}>
                <Title heading={4} className={styles.question}>
                  {currentReview.isJapaneseQuestion
                    ? currentReview.word.japanese
                    : currentReview.word.chinese}
                </Title>
              </div>

              {showAnswer ? (
                <>
                  <div className={styles.answerWrapper}>
                    <Title heading={4} className={styles.answer}>
                      {currentReview.isJapaneseQuestion
                        ? currentReview.word.chinese
                        : currentReview.word.japanese}
                    </Title>
                    <Button
                      type="tertiary"
                      size="small"
                      className={styles.voice}
                      icon={<Voice className={styles.icon} />}
                      onClick={(e) =>
                        handleSpeak(currentReview.word.japanese, e)
                      }
                      style={{ marginLeft: 8 }}
                    />
                  </div>
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
                      type="secondary"
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
                    type="secondary"
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
