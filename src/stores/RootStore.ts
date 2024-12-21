import { makeAutoObservable } from "mobx";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export class RootStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  private initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.setUser(user);
      this.setIsLoading(false);
    });
  }

  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
  }

  setIsLoading(loading: boolean) {
    this.isLoading = loading;
  }
}

const rootStore = new RootStore();
export default rootStore;
