import { makeAutoObservable, runInAction } from "mobx";
import { getWords } from "@/services/firebase/words";
import { IWord } from "@/services/types";
import { getEndOfDay } from "@/utils";
import authStore from "./AuthStore";

const COMPLETED_STAGE = 7;

class WordStore {
  words: IWord[] = [];
  loading: boolean = false;
  initialized: boolean = false;

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

  async loadWords() {
    if (!authStore.user?.uid || this.loading) return;

    this.loading = true;
    try {
      const fetchedWords = await getWords(authStore.user.uid);
      runInAction(() => {
        this.words = fetchedWords;
        this.initialized = true;
      });
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  updateWords(updatedWords: IWord[]) {
    this.words = updatedWords;
  }
}

const wordStore = new WordStore();
export default wordStore;
