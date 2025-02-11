import { makeAutoObservable } from "mobx";
import { User, AuthError } from "firebase/auth";
import {
  signIn,
  signUp,
  signOut,
  onAuthChange,
  updatePassword,
  sendEmailVerification,
} from "@/services/firebase/auth";

class AuthStore {
  user: User | null = null;
  loading = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initAuth();
  }

  private initAuth() {
    onAuthChange((user) => {
      this.setUser(user);
      this.setLoading(false);
    });
  }

  setUser(user: User | null) {
    this.user = user;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  async login(email: string, password: string) {
    try {
      await signIn(email, password);
      this.setError(null);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      this.setError(authError.message);
      return false;
    }
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await signUp(email, password);
      // 注册成功后立即发送验证邮件
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      this.setError(null);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      this.setError(authError.message);
      return false;
    }
  }

  async resendVerificationEmail() {
    try {
      if (!this.user) {
        throw new Error("No user logged in");
      }
      await sendEmailVerification(this.user);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      this.setError(authError.message);
      return false;
    }
  }

  async logout() {
    try {
      await signOut();
      this.setError(null);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      this.setError(authError.message);
      return false;
    }
  }

  async updatePassword(newPassword: string) {
    try {
      if (!this.user) {
        throw new Error("No user logged in");
      }
      await updatePassword(this.user, newPassword);
      this.setError(null);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      this.setError(authError.message);
      return false;
    }
  }

  get isEmailVerified() {
    return this.user?.emailVerified ?? false;
  }
}

export default new AuthStore();
