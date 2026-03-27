import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, db, auth };

export const loginWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Login with redirect failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Types
export interface Expense {
  id?: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  rawText: string;
  createdAt: Date;
  userId: string;
}

// Helper functions for Database
export const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
  if (!expense.userId) throw new Error("User must be logged in");
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expense,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...expense };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getExpenses = async (userId: string) => {
  if (!userId) return [];
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense);
    });
    return expenses;
  } catch (e) {
    console.error("Error fetching generic document: ", e);
    throw e;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    const docRef = doc(db, "expenses", id);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting generic document: ", e);
    throw e;
  }
};
