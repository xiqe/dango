import { makeAutoObservable, runInAction } from "mobx";
import { IGroup } from "@/services/types";
import i18n from "i18next";
import {
  getGroups,
  createGroup,
  updateGroup,
} from "@/services/firebase/groups";
import authStore from "./AuthStore";

class GroupStore {
  groups: IGroup[] = [];
  loading: boolean = false;
  initialized: boolean = false;
  currentGroupId: string = "default";

  constructor() {
    makeAutoObservable(this);
  }

  async loadGroups() {
    if (!authStore.user?.uid || this.loading) return;

    this.loading = true;
    try {
      const groups = await getGroups(authStore.user.uid);

      const defaultGroup = {
        id: "default",
        name: i18n.t("common.all"),
        order: -1,
        created_at: 0,
      };

      runInAction(() => {
        this.groups = [defaultGroup, ...groups];
        this.initialized = true;
      });
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createGroup(name: string) {
    if (!authStore.user?.uid) {
      return;
    }

    this.loading = true;
    try {
      const newGroup = {
        name,
        order: this.groups.length,
        created_at: Date.now(),
      };

      const docRef = await createGroup(authStore.user.uid, newGroup);

      runInAction(() => {
        this.groups.push({
          id: docRef.id,
          ...newGroup,
        });
        this.currentGroupId = docRef.id;
      });
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateGroup(groupId: string, name: string) {
    if (!authStore.user?.uid) {
      console.error("No user ID available");
      return;
    }

    if (groupId === "default") {
      console.error("Cannot update default group");
      return;
    }

    this.loading = true;
    try {
      await updateGroup(authStore.user.uid, groupId, { name });

      runInAction(() => {
        const groupIndex = this.groups.findIndex((g) => g.id === groupId);
        if (groupIndex !== -1) {
          this.groups[groupIndex] = {
            ...this.groups[groupIndex],
            name,
          };
        }
      });
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setCurrentGroup(groupId: string) {
    this.currentGroupId = groupId;
  }
}

const groupStore = new GroupStore();
export default groupStore;
