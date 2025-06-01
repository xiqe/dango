import { Button, Tag } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { IWord } from "@/services/types";
import { useSpeech } from "@/hooks";
import styles from "./word.module.css";

interface IWordInfoProps {
  word: IWord;
}

const WordInfo = ({ word }: IWordInfoProps) => {
  const { t } = useTranslation();
  const handleSpeak = useSpeech();

  return (
    <div className={styles.answerWrapper}>
      <div className={styles.japanese}>
        {word.japanese}

        <Button
          type="tertiary"
          size="small"
          className={styles.voice}
          onClick={(e) => handleSpeak(word.japanese, e)}
          style={{ marginLeft: 8 }}
        >
          {t("common.pronunciation")}
        </Button>

        <div className={styles.pronunciation}>{word.pronunciation}</div>
      </div>

      <div className={styles.item}>
        <Tag color="blue" size="large" className={styles.label}>
          {t("common.chinese")}
        </Tag>
        {word.chinese}
      </div>
      {word.example && (
        <div className={styles.item}>
          <Tag color="blue" size="large" className={styles.label}>
            {t("common.example")}
          </Tag>
          {word.example}
          <Button
            type="tertiary"
            size="small"
            className={styles.voice}
            onClick={(e) => handleSpeak(word.example as string, e)}
            style={{ marginLeft: 8 }}
          >
            {t("common.pronunciation")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordInfo;
