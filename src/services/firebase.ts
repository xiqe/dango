import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Sign in successful:", result.user.email);
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
    console.log("Sign up successful:", result.user.email);
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
    console.log("Sign out successful");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updatePassword = async (user: User, newPassword: string) => {
  try {
    await firebaseUpdatePassword(user, newPassword);
    console.log("Password updated successfully");
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};
