import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import cls from "clsx";
import { Button, Space, Typography, Input } from "@douyinfe/semi-ui";
import { Search } from "@/assets/index";
import { observer } from "mobx-react-lite";
import { Voice } from "@/assets/index";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import { useNavigate } from "react-router-dom";
import styles from "./word.module.css";

const { Text, Title } = Typography;

const Word = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [japaneseVoice, setJapaneseVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const jaVoice =
        voices.find((voice) => voice.name === "Kyoko") ||
        voices.find(
          (voice) =>
            (voice.lang.toLowerCase().includes("ja") ||
              voice.name.toLowerCase().includes("japanese")) &&
            voice.name.toLowerCase().includes("female")
        ) ||
        voices.find(
          (voice) =>
            voice.lang.toLowerCase().includes("ja") ||
            voice.name.toLowerCase().includes("japanese")
        );
      setJapaneseVoice(jaVoice || null);
    };

    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const filteredWords = useMemo(() => {
    if (!searchTerm) return wordStore.words;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return wordStore.words.filter(
      (word) =>
        word.japanese.toLowerCase().includes(lowerSearchTerm) ||
        word.chinese.toLowerCase().includes(lowerSearchTerm)
    );
  }, [wordStore.words, searchTerm]);

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 停止之前的朗读
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

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
                    <div>
                      <Title heading={5} style={{ marginBottom: 4 }}>
                        {word.japanese}
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
