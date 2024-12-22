import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Button, Form, Space, Typography } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { getWord, updateWord, deleteWord } from "@/services/firebase/words";
import { IWord } from "@/services/types";
import authStore from "@/stores/AuthStore";
import styles from "./detail.module.css";

const { Text } = Typography;

const WordDetail = observer(() => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState<IWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      if (!authStore.user?.uid || !id) return;
      try {
        const wordData = await getWord(authStore.user.uid, id);
        setWord(wordData);
      } catch (error) {
        console.error("Error loading word:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWord();
  }, [id, authStore.user?.uid]);

  const handleUpdate = async (values: {
    japanese: string;
    chinese: string;
  }) => {
    if (!authStore.user?.uid || !id || !word) return;

    setSaving(true);
    try {
      await updateWord(authStore.user.uid, id, {
        ...word,
        japanese: values.japanese,
        chinese: values.chinese,
      });
      navigate("/word");
    } catch (error) {
      console.error("Error updating word:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!authStore.user?.uid || !id) return;

    setDeleting(true);
    try {
      await deleteWord(authStore.user.uid, id);
      navigate("/word");
    } catch (error) {
      console.error("Error deleting word:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!authStore.user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Text>{t("common.pleaseLogin")}</Text>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Text>{t("common.loading")}</Text>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Text>{t("common.notFound")}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Form
          initValues={{ japanese: word.japanese, chinese: word.chinese }}
          onSubmit={handleUpdate}
        >
          <Form.Input
            field="japanese"
            label={t("common.japanese")}
            rules={[{ required: true }]}
            size="large"
          />
          <Form.Input
            field="chinese"
            label={t("common.chinese")}
            rules={[{ required: true }]}
            size="large"
          />
          <div className={styles.actions}>
            <Button
              theme="solid"
              type="primary"
              htmlType="submit"
              loading={saving}
              className={styles.button}
              size="large"
            >
              {t("common.save")}
            </Button>
            <Button
              theme="solid"
              className={styles.button2}
              onClick={() => navigate("/word")}
              size="large"
            >
              {t("common.cancel")}
            </Button>
            <Button
              theme="solid"
              type="danger"
              onClick={handleDelete}
              loading={deleting}
              size="large"
            >
              {t("common.deleteButton")}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export default WordDetail;
