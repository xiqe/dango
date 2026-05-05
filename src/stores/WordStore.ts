import { makeAutoObservable, runInAction } from "mobx";
import { subscribeToWords } from "@/services/firebase/words";
import { IWord } from "@/services/types";
import { getEndOfDay } from "@/utils";
import authStore from "./AuthStore";
import type { Unsubscribe } from "firebase/firestore";

const COMPLETED_STAGE = 7;

class WordStore {
  words: IWord[] = [];
  loading: boolean = false;
  initialized: boolean = false;
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get todayWords() {
    const endOfToday = getEndOfDay();
    return this.words.filter((word) => word.nextReviewDate <= endOfToday)
      .length;
  }

  get completedWordsCount() {
    return this.words.filter((word) => word.stage === COMPLETED_STAGE).length;
  }

  // 使用实时监听订阅单词数据
  subscribeWords() {
    if (!authStore.user?.uid || this.unsubscribe) return;

    this.loading = true;

    this.unsubscribe = subscribeToWords(
      authStore.user.uid,
      (words) => {
        runInAction(() => {
          this.words = words;
          this.initialized = true;
          this.loading = false;
        });
      },
      (error) => {
        console.error("Error in words subscription:", error);
        runInAction(() => {
          this.loading = false;
        });
      }
    );
  }

  // 取消订阅（用于用户登出时）
  unsubscribeWords() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.initialized = false;
      this.words = [];
    }
  }

  // 保留此方法用于手动更新本地状态（乐观更新）
  updateWords(updatedWords: IWord[]) {
    this.words = updatedWords;
  }

  updateWord(id: string, updates: Partial<IWord>) {
    this.words = this.words.map((word) =>
      word.id === id ? { ...word, ...updates } : word
    );
  }
}

const wordStore = new WordStore();
export default wordStore;
