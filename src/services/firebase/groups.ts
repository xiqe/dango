import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { IGroup } from "@/services/types";

export const getGroups = async (uid: string) => {
  try {
    const groupsRef = collection(db, `users/${uid}/groups`);
    const q = query(groupsRef, orderBy("order"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IGroup[];
  } catch (error) {
    console.error("Error in getGroups:", error);
    throw error;
  }
};

// 实时监听分组数据变化
export const subscribeToGroups = (
  uid: string,
  onData: (groups: IGroup[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const groupsRef = collection(db, `users/${uid}/groups`);
  const q = query(groupsRef, orderBy("order"));

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IGroup[];
      onData(groups);
    },
    (error) => {
      console.error("Error in groups subscription:", error);
      onError?.(error);
    }
  );
};

export const createGroup = async (uid: string, group: Omit<IGroup, "id">) => {
  try {
    const userGroupsRef = collection(db, `users/${uid}/groups`);

    const docRef = await addDoc(userGroupsRef, {
      ...group,
      created_at: Date.now(),
    });

    return docRef;
  } catch (error) {
    console.error("Error in createGroup:", error);
    throw error;
  }
};

export const updateGroup = async (
  uid: string,
  groupId: string,
  updates: Partial<IGroup>
) => {
  try {
    const groupRef = doc(db, `users/${uid}/groups/${groupId}`);
    await updateDoc(groupRef, {
      ...updates,
      updated_at: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Error in updateGroup:", error);
    throw error;
  }
};
