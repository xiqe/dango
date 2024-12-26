import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
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
