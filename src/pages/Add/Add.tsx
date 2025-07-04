import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Space,
  Typography,
  TextArea,
  Toast,
  Select,
} from "@douyinfe/semi-ui";
import { IWord } from "@/services/types";
import { addWord } from "@/services/firebase/words";
import { observer } from "mobx-react-lite";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import groupStore from "@/stores/GroupStore";
import styles from "./add.module.css";

const { Text } = Typography;

const Add = observer(() => {
  const { t } = useTranslation();
  const [japanese, setJapanese] = useState("");
  const [chinese, setChinese] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [example, setExample] = useState("");
  const [singleGroupId, setSingleGroupId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [addingWord, setAddingWord] = useState(false);
  const [addingBatch, setAddingBatch] = useState(false);

  const handleAddWord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!authStore.user?.uid || addingWord) {
        return;
      }

      if (!japanese.trim() || !chinese.trim()) {
        Toast.error(t("addWord.requiredFields"));
        return;
      }

      setAddingWord(true);
      try {
        const newWord: Omit<IWord, "id"> = {
          japanese: japanese.trim(),
          chinese: chinese.trim(),
          pronunciation: pronunciation.trim(),
          example: example.trim(),
          groupId: singleGroupId,
          createdAt: Date.now(),
          nextReviewDate: Date.now(),
          reviewCount: 0,
          correctCount: 0,
          stage: 0,
        };

        await addWord(authStore.user.uid, newWord);
        await wordStore.loadWords();

        setJapanese("");
        setChinese("");
        setPronunciation("");
        setExample("");
        Toast.success(t("addWord.addSuccess"));
      } catch (error) {
        console.error("Error adding word:", error);
        Toast.error(t("addWord.addError"));
      } finally {
        setAddingWord(false);
      }
    },
    [
      japanese,
      chinese,
      pronunciation,
      example,
      singleGroupId,
      authStore.user?.uid,
      addingWord,
      t,
    ]
  );

  const handleBatchUpload = useCallback(async () => {
    if (!authStore.user?.uid || !jsonInput.trim() || addingBatch) return;

    setAddingBatch(true);
    try {
      const words = JSON.parse(jsonInput);

      if (!Array.isArray(words)) {
        Toast.error(t("common.invalidJSON"));
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const word of words) {
        if (!word.japanese || !word.chinese) {
          errorCount++;
          continue;
        }

        const newWord: Omit<IWord, "id"> = {
          japanese: word.japanese.trim(),
          chinese: word.chinese.trim(),
          pronunciation: word.pronunciation?.trim(),
          example: word.example?.trim(),
          groupId: word.groupId?.trim(),
          createdAt: Date.now(),
          nextReviewDate: Date.now(),
          reviewCount: 0,
          correctCount: 0,
          stage: 0,
        };

        try {
          await addWord(authStore.user.uid, newWord);
          successCount++;
        } catch (error) {
          console.error("Error adding word:", error);
          errorCount++;
        }
      }

      await wordStore.loadWords();

      setJsonInput("");
      Toast.success(
        t("addWord.batchUploadResult", {
          success: successCount,
          error: errorCount,
        })
      );
    } catch (error) {
      console.error("Error parsing JSON:", error);
      Toast.error(t("addWord.invalidJSON"));
    } finally {
      setAddingBatch(false);
    }
  }, [jsonInput, authStore.user?.uid, addingBatch, t]);

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
    <div className="container">
      <div className="card">
        <h2 className={styles.title}>{t("nav.add")}</h2>
        <Space
          vertical
          align="start"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <form onSubmit={handleAddWord} className={styles.form}>
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
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Input
                value={chinese}
                onChange={(value) => setChinese(value)}
                placeholder={t("common.chinese")}
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Input
                value={pronunciation}
                onChange={(value) => setPronunciation(value)}
                placeholder={t("common.pronunciation")}
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Input
                value={example}
                onChange={(value) => setExample(value)}
                placeholder={t("common.example")}
                className={styles.input}
                size="large"
                showClear
                disabled={addingWord}
              />
              <Select
                value={singleGroupId}
                onChange={(value) => setSingleGroupId(value as string)}
                disabled={addingWord}
                size="large"
                style={{ width: "100%" }}
                placeholder={t("common.group")}
              >
                {groupStore.groups.map((group) => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="secondary"
                htmlType="submit"
                theme="solid"
                size="large"
                className={styles.submitButton}
                loading={addingWord}
              >
                {t("common.addButton")}
              </Button>
            </Space>
          </form>
        </Space>

        <h2 className={styles.title} style={{ marginTop: "48px" }}>
          {t("addWord.batchUploadTitle")}
        </h2>
        <Space
          vertical
          align="start"
          spacing="medium"
          style={{ width: "100%" }}
        >
          <TextArea
            value={jsonInput}
            onChange={(value) => setJsonInput(value)}
            placeholder={`[
  {"japanese": "言葉1", "chinese": "词语1", "pronunciation": "ことばいち", "example": "こんにちは"},
  {"japanese": "言葉2", "chinese": "词语2", "pronunciation": "ことばに", "example": "こんばんは"}
]`}
            className={styles.jsonInput}
            rows={5}
            disabled={addingBatch}
          />
          <Button
            type="secondary"
            theme="solid"
            size="large"
            className={styles.submitButton}
            loading={addingBatch}
            onClick={handleBatchUpload}
          >
            {t("addWord.batchUploadButton")}
          </Button>
        </Space>
      </div>
    </div>
  );
});

export default Add;
