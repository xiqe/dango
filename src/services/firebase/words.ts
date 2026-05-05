import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { IWord } from "@/services/types";

export const getWords = async (userId: string): Promise<IWord[]> => {
  try {
    const wordsRef = collection(db, `users/${userId}/words`);
    const snapshot = await getDocs(wordsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as IWord)
    );
  } catch (error) {
    console.error("Error fetching words:", error);
    throw error;
  }
};

// 实时监听单词数据变化，利用缓存并获取实时更新
export const subscribeToWords = (
  userId: string,
  onData: (words: IWord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const wordsRef = collection(db, `users/${userId}/words`);

  return onSnapshot(
    wordsRef,
    (snapshot) => {
      const words = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as IWord)
      );
      onData(words);
    },
    (error) => {
      console.error("Error in words subscription:", error);
      onError?.(error);
    }
  );
};

export const addWord = async (userId: string, word: Omit<IWord, "id">) => {
  try {
    const wordsRef = collection(db, `users/${userId}/words`);
    const docRef = await addDoc(wordsRef, {
      ...word,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding word:", error);
    throw error;
  }
};

export const deleteWord = async (userId: string, wordId: string) => {
  try {
    const wordRef = doc(db, `users/${userId}/words/${wordId}`);
    await deleteDoc(wordRef);
  } catch (error) {
    console.error("Error deleting word:", error);
    throw error;
  }
};

export const updateWordProgress = async (
  userId: string,
  wordId: string,
  updates: Partial<IWord>
) => {
  try {
    const wordRef = doc(db, `users/${userId}/words/${wordId}`);
    await updateDoc(wordRef, updates);
  } catch (error) {
    console.error("Error updating word:", error);
    throw error;
  }
};

export const getWordsForReview = async (userId: string): Promise<IWord[]> => {
  try {
    const wordsRef = collection(db, `users/${userId}/words`);
    const q = query(wordsRef, where("nextReviewDate", "<=", Date.now()));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as IWord)
    );
  } catch (error) {
    console.error("Error fetching words for review:", error);
    throw error;
  }
};
export const getWord = async (
  userId: string,
  wordId: string
): Promise<IWord> => {
  try {
    const docRef = doc(db, `users/${userId}/words/${wordId}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Word not found");
    }
    return { id: docSnap.id, ...docSnap.data() } as IWord;
  } catch (error) {
    console.error("Error fetching word:", error);
    throw error;
  }
};

export const updateWord = async (
  userId: string,
  wordId: string,
  wordData: IWord
): Promise<void> => {
  const { id, ...data } = wordData;
  const docRef = doc(db, "users", userId, "words", wordId);
  await updateDoc(docRef, data);
};
