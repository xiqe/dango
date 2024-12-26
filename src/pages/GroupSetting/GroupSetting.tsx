import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Toast,
} from "@douyinfe/semi-ui";
import { Create, Edit } from "@/assets/index";
import { observer } from "mobx-react-lite";
import groupStore from "@/stores/GroupStore";
import authStore from "@/stores/AuthStore";
import styles from "./setting.module.css";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const GroupSetting = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleGroupSubmit = async () => {
    if (!groupName.trim()) return;

    try {
      if (editingGroup) {
        await groupStore.updateGroup(editingGroup.id, groupName.trim());
        Toast.success(t("group.updateSuccess"));
      } else {
        await groupStore.createGroup(groupName.trim());
        Toast.success(t("group.createSuccess"));
      }
      handleModalClose();
    } catch (error) {
      Toast.error(t(editingGroup ? "group.updateError" : "group.createError"));
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setGroupName("");
    setEditingGroup(null);
  };

  const openModal = (group?: { id: string; name: string }) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
    } else {
      setEditingGroup(null);
      setGroupName("");
    }
    setModalVisible(true);
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
    <div className="container">
      <div className="card">
        <div className={styles.header}>
          <Title heading={3} style={{ margin: 0 }}>
            {t("group.settings")}
          </Title>
          <Button
            theme="outline"
            type="tertiary"
            onClick={() => navigate("/word")}
          >
            {t("common.back")}
          </Button>
        </div>

        <Space
          vertical
          align="start"
          style={{ width: "100%", marginTop: 24 }}
          className={styles.group}
        >
          <div className={styles.gridContainer}>
            {groupStore.groups.map((group) => (
              <div key={group.id} className={styles.groupItem}>
                <div className={styles.name}>{group.name}</div>
                <Space>
                  <Button
                    theme="outline"
                    type="tertiary"
                    icon={<Edit className={styles.editIcon} />}
                    onClick={() => openModal(group)}
                  />
                </Space>
              </div>
            ))}
            <div className={styles.groupItem}>
              <Button
                theme="outline"
                type="secondary"
                icon={<Create className={styles.icon} />}
                onClick={() => openModal()}
              />
            </div>
          </div>
        </Space>

        <Modal
          title={editingGroup ? t("common.edit") : t("group.create")}
          visible={modalVisible}
          onOk={handleGroupSubmit}
          okButtonProps={{ size: "large", type: "secondary" }}
          onCancel={handleModalClose}
          okText={t("common.confirm")}
          cancelText={t("common.cancel")}
          cancelButtonProps={{ size: "large" }}
          className={styles.modal}
          centered
        >
          <Input
            value={groupName}
            size="large"
            onChange={(value) => setGroupName(value)}
            placeholder={t("group.nameInputPlaceholder")}
          />
        </Modal>
      </div>
    </div>
  );
});

export default GroupSetting;
