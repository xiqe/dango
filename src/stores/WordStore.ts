import { makeAutoObservable, runInAction } from "mobx";
import { getWords } from "@/services/firebase/words";
import { IWord } from "@/services/types";
import authStore from "./AuthStore";

class WordStore {
  words: IWord[] = [];
  loading: boolean = false;
  initialized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get todayWords() {
    return this.words.filter((word) => word.nextReviewDate <= Date.now())
      .length;
  }

  get reviewProgress() {
    const totalReviews = this.words.reduce(
      (sum, word) => sum + word.reviewCount,
      0
    );
    const totalCorrect = this.words.reduce(
      (sum, word) => sum + word.correctCount,
      0
    );
    const correctRate =
      totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    return { correctRate, totalReviews };
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
