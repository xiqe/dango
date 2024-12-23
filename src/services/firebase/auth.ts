import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification as firebaseSendEmailVerification,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "@/config/firebase";

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign in error:", {
      code: authError.code,
      message: authError.message,
      name: authError.name,
    });
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign up error:", {
      code: authError.code,
      message: authError.message,
      name: authError.name,
    });
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updatePassword = async (user: User, newPassword: string) => {
  try {
    await firebaseUpdatePassword(user, newPassword);
  } catch (error) {
    throw error;
  }
};

export const sendEmailVerification = async (user: User) => {
  try {
    await firebaseSendEmailVerification(user);
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
};
