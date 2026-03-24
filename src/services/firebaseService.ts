import { db, auth } from "../firebase";
import { 
  User, 
  Product, 
  Subscription, 
  SubscriptionDay, 
  Order, 
  WalletTransaction, 
  LoyaltyTransaction 
} from "../types";

// Correcting imports for firestore
import { 
  collection as fsCollection, 
  doc as fsDoc, 
  getDoc as fsGetDoc, 
  getDocs as fsGetDocs, 
  setDoc as fsSetDoc, 
  updateDoc as fsUpdateDoc, 
  deleteDoc as fsDeleteDoc, 
  query as fsQuery, 
  where as fsWhere, 
  onSnapshot as fsOnSnapshot,
  getDocFromServer as fsGetDocFromServer
} from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // User Profile
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const docRef = fsDoc(db, "users", uid);
      const docSnap = await fsGetDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as User) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await fsGetDocs(fsCollection(db, "products"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "products");
      return [];
    }
  },

  // Subscriptions
  async createSubscription(subscription: Omit<Subscription, "id">): Promise<string> {
    try {
      const newDocRef = fsDoc(fsCollection(db, "subscriptions"));
      await fsSetDoc(newDocRef, { ...subscription, id: newDocRef.id });
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "subscriptions");
      return "";
    }
  },

  // Wallet
  async updateWalletBalance(uid: string, newBalance: number, transaction: Omit<WalletTransaction, "id">) {
    try {
      const userRef = fsDoc(db, "users", uid);
      const txRef = fsDoc(fsCollection(db, "wallet_transactions"));
      
      await fsUpdateDoc(userRef, { walletBalance: newBalance });
      await fsSetDoc(txRef, { ...transaction, id: txRef.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Loyalty
  async updateLoyaltyPoints(uid: string, newPoints: number, transaction: Omit<LoyaltyTransaction, "id">) {
    try {
      const userRef = fsDoc(db, "users", uid);
      const txRef = fsDoc(fsCollection(db, "loyalty_transactions"));
      
      await fsUpdateDoc(userRef, { loyaltyPoints: newPoints });
      await fsSetDoc(txRef, { ...transaction, id: txRef.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }
};
