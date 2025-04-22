import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, Tag } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { IWord } from "@/services/types";
import { ProgressRing } from "@/components";
import { useSpeech } from "@/hooks";
import { Voice } from "@/assets/index";
import wordStore from "@/stores/WordStore";
import groupStore from "@/stores/GroupStore";
import styles from "./practise.module.css";

const { Text, Title } = Typography;

const COMPLETED_STAGE = 7;

interface WordState {
  word: IWord;
  isJapaneseQuestion: boolean;
}

const Practise = observer(() => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentWord, setCurrentWord] = useState<WordState | null>(null);
  const [practiseWords, setPractiseWords] = useState<WordState[]>([]);
  const [selectedStages, setSelectedStages] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [isJapaneseQuestion, setIsJapaneseQuestion] = useState(false);

  useEffect(() => {
    const practiseWords = wordStore.words.filter((word) =>
      selectedStages.includes(word.stage)
    );
    const wordState = practiseWords.map((word) => ({
      word,
      isJapaneseQuestion: isJapaneseQuestion,
    }));
    setPractiseWords(wordState);
    setCurrentWord(wordState[Math.floor(Math.random() * wordState.length)]);
  }, [wordStore.words, selectedStages, isJapaneseQuestion]);

  const handleSpeak = useSpeech();

  const getGroupName = useCallback(
    (groupId: string | undefined) => {
      if (!groupId) return t("common.all");
      const group = groupStore.groups.find((g) => g.id === groupId);
      return group ? group.name : t("common.all");
    },
    [groupStore.groups, t]
  );

  const toNext = useCallback(() => {
    setShowAnswer(false);
    setCurrentWord(
      practiseWords[Math.floor(Math.random() * practiseWords.length)]
    );
  }, [practiseWords]);

  return (
    <div className="container">
      <div className={styles.stageSelector}>
        {Array.from({ length: COMPLETED_STAGE + 1 }, (_, i) => (
          <Tag
            key={i}
            color={selectedStages.includes(i) ? "blue" : "white"}
            className={styles.tag}
            onClick={() => {
              setSelectedStages((prev) => {
                if (prev.includes(i)) {
                  return prev.filter((stage) => stage !== i);
                } else {
                  return [...prev, i];
                }
              });
            }}
          >
            {i}
          </Tag>
        ))}
      </div>
      <div className={styles.questionTypeSelector}>
        <Tag
          color={isJapaneseQuestion ? "white" : "blue"}
          onClick={() => setIsJapaneseQuestion(false)}
          className={styles.tag}
        >
          {t("practise.chinese")}
        </Tag>
        <Tag
          color={isJapaneseQuestion ? "blue" : "white"}
          onClick={() => setIsJapaneseQuestion(true)}
          className={styles.tag}
        >
          {t("practise.japanese")}
        </Tag>
      </div>

      <div className={styles.reviewArea}>
        {currentWord ? (
          <div className={styles.wordCard}>
            <div className={styles.statistics}>
              <div className={styles.left}>
                <div className={styles.groupInfo}>
                  <Tag color="blue" size="large">
                    {getGroupName(currentWord.word.groupId)}
                  </Tag>
                </div>
                {t("review.accuracy")}：
                <span>
                  {currentWord.word.reviewCount === 0
                    ? "0"
                    : (
                        (currentWord.word.correctCount /
                          currentWord.word.reviewCount) *
                        100
                      ).toFixed(1)}
                  %
                </span>
              </div>
              <ProgressRing stage={currentWord?.word.stage} size={48} />
            </div>

            <div className={styles.questionWrapper}>
              <Title heading={4} className={styles.question}>
                {currentWord.isJapaneseQuestion
                  ? currentWord.word.japanese
                  : currentWord.word.chinese}
              </Title>
            </div>

            {showAnswer ? (
              <>
                <div className={styles.answerWrapper}>
                  <Title heading={4} className={styles.answer}>
                    {currentWord.isJapaneseQuestion
                      ? currentWord.word.chinese
                      : currentWord.word.japanese}
                  </Title>
                  <Button
                    type="tertiary"
                    size="small"
                    className={styles.voice}
                    icon={<Voice className={styles.icon} />}
                    onClick={(e) => handleSpeak(currentWord.word.japanese, e)}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div className={styles.cardFoot}>
                  <Button
                    type="secondary"
                    theme="solid"
                    size="large"
                    className={styles.button}
                    onClick={toNext}
                  >
                    {t("practise.next")}
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
  );
});

export default Practise;
