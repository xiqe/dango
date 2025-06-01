import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Button, Form, Typography } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { getWord, updateWord, deleteWord } from "@/services/firebase/words";
import { IWord } from "@/services/types";
import authStore from "@/stores/AuthStore";
import wordStore from "@/stores/WordStore";
import groupStore from "@/stores/GroupStore";
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
    if (!groupStore.initialized) {
      groupStore.loadGroups();
    }
  }, []);

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
    pronunciation: string;
    example: string;
    groupId: string;
  }) => {
    if (!authStore.user?.uid || !id || !word) return;

    setSaving(true);
    try {
      await updateWord(authStore.user.uid, id, {
        ...word,
        japanese: values.japanese,
        chinese: values.chinese,
        pronunciation: values.pronunciation,
        example: values.example,
        groupId: values.groupId,
      });
      await wordStore.loadWords();
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
      await wordStore.loadWords();
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
          initValues={{
            japanese: word.japanese,
            chinese: word.chinese,
            pronunciation: word.pronunciation,
            example: word.example,
            groupId: word.groupId,
          }}
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
          <Form.Input
            field="pronunciation"
            label={t("common.pronunciation")}
            size="large"
          />
          <Form.Input
            field="example"
            label={t("common.example")}
            size="large"
          />
          <Form.Select
            field="groupId"
            label={t("common.group")}
            size="large"
            placeholder={t("common.group")}
            style={{ width: "100%" }}
          >
            {groupStore.groups.map((group) => (
              <Form.Select.Option key={group.id} value={group.id}>
                {group.name}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <div className={styles.actionButtons}>
            <Button
              theme="solid"
              type="secondary"
              htmlType="submit"
              loading={saving}
              className={styles.button}
              size="large"
            >
              {t("common.save")}
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

            <Button
              theme="solid"
              type="tertiary"
              size="large"
              onClick={() => navigate("/word")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export default WordDetail;
