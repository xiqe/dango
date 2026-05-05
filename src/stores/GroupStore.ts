import { makeAutoObservable, runInAction, computed } from "mobx";
import { IGroup } from "@/services/types";
import i18n from "i18next";
import {
  createGroup,
  updateGroup,
  subscribeToGroups,
} from "@/services/firebase/groups";
import authStore from "./AuthStore";
import type { Unsubscribe } from "firebase/firestore";

class GroupStore {
  private rawGroups: IGroup[] = [];
  loading: boolean = false;
  initialized: boolean = false;
  currentGroupId: string = "default";
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    makeAutoObservable(this, {
      groups: computed,
      currentGroup: computed,
    });
  }

  get allGroups(): IGroup[] {
    return [this.defaultGroup, ...this.rawGroups];
  }

  get groups(): IGroup[] {
    return this.rawGroups;
  }

  get currentGroup(): IGroup | undefined {
    return this.groups.find((g) => g.id === this.currentGroupId);
  }

  private get defaultGroup(): IGroup {
    return {
      id: "default",
      name: i18n.t("common.all"),
      order: -1,
      created_at: 0,
    };
  }

  // 使用实时监听订阅分组数据
  subscribeGroups() {
    if (!authStore.user?.uid || this.unsubscribe) return;

    this.loading = true;

    this.unsubscribe = subscribeToGroups(
      authStore.user.uid,
      (groups) => {
        runInAction(() => {
          this.rawGroups = groups;
          this.initialized = true;
          this.loading = false;
        });
      },
      (error) => {
        console.error("Error in groups subscription:", error);
        runInAction(() => {
          this.loading = false;
        });
      }
    );
  }

  // 取消订阅
  unsubscribeGroups() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.initialized = false;
      this.rawGroups = [];
    }
  }

  async createGroup(name: string) {
    if (!authStore.user?.uid) return;

    this.loading = true;
    try {
      const newGroup = {
        name,
        order: this.rawGroups.length,
        created_at: Date.now(),
      };

      const docRef = await createGroup(authStore.user.uid, newGroup);

      runInAction(() => {
        this.rawGroups.push({
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
        const groupIndex = this.rawGroups.findIndex((g) => g.id === groupId);
        if (groupIndex !== -1) {
          this.rawGroups[groupIndex] = {
            ...this.rawGroups[groupIndex],
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
    if (this.groups.some((g) => g.id === groupId)) {
      this.currentGroupId = groupId;
    } else {
      console.error(`Invalid group ID: ${groupId}`);
      this.currentGroupId = "default";
    }
  }
}

const groupStore = new GroupStore();
export default groupStore;
