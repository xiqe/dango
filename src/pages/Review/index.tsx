import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Typography, Space, Progress } from "@douyinfe/semi-ui";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

interface Word {
  id: string;
  japanese: string;
  chinese: string;
  createdAt: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  stage: number;
}

const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

const Review = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentReviewWord, setCurrentReviewWord] = useState<Word | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    const savedWords = localStorage.getItem("words");
    if (savedWords) {
      const parsedWords = JSON.parse(savedWords);
      setWords(parsedWords);
      const reviewWords = parsedWords.filter(
        (word: Word) => word.nextReviewDate <= Date.now()
      );
      setCurrentReviewWord(reviewWords[0] || null);
    }
  };

  const saveToLocalStorage = (updatedWords: Word[]) => {
    localStorage.setItem("words", JSON.stringify(updatedWords));
    setWords(updatedWords);
  };

  const handleReview = (remembered: boolean) => {
    if (currentReviewWord) {
      const updatedWords = words.map((word) => {
        if (word.id === currentReviewWord.id) {
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

      saveToLocalStorage(updatedWords);
      const remainingWords = updatedWords.filter(
        (word) => word.nextReviewDate <= Date.now()
      );
      setCurrentReviewWord(remainingWords[0] || null);
      setShowAnswer(false);
    }
  };

  const getProgress = () => {
    const totalReviews = words.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = words.reduce(
      (sum, word) => sum + word.correctCount,
      0
    );
    const correctRate =
      totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    return { correctRate, totalReviews };
  };

  const progress = getProgress();
  const todayWords = words.filter(
    (word) => word.nextReviewDate <= Date.now()
  ).length;

  return (
    <div className="container safe-area-inset-bottom">
      <Card className="mt-lg">
        <Space
          vertical
          align="center"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>{t("review.todayReview", { count: todayWords })}</Text>
          </div>

          <div style={{ width: "100%", textAlign: "center" }}>
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

          <div
            style={{ width: "100%", textAlign: "center", minHeight: "200px" }}
          >
            {currentReviewWord ? (
              <Space vertical align="center" spacing="medium">
                <Title heading={2}>{currentReviewWord.japanese}</Title>
                {showAnswer ? (
                  <>
                    <Title heading={3}>{currentReviewWord.chinese}</Title>
                    <Space>
                      <Button
                        type="warning"
                        onClick={() => handleReview(false)}
                      >
                        {t("review.forgotten")}
                      </Button>
                      <Button type="primary" onClick={() => handleReview(true)}>
                        {t("review.remembered")}
                      </Button>
                    </Space>
                  </>
                ) : (
                  <Button type="primary" onClick={() => setShowAnswer(true)}>
                    {t("review.showAnswer")}
                  </Button>
                )}
              </Space>
            ) : (
              <div style={{ marginTop: "40px" }}>
                <Text type="secondary" size="normal">
                  {t("review.completed")}
                </Text>
              </div>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Review;
