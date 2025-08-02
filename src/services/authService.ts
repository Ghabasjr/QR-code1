import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import { User } from '@/types';

export const authService = {
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        phoneNumber: userData?.phoneNumber || '',
        profileImageUrl: firebaseUser.photoURL || '',
        addresses: userData?.addresses || [],
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: userData?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      return {
        user,
        token: await firebaseUser.getIdToken(),
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName,
        lastName,
        phoneNumber: phoneNumber || '',
        profileImageUrl: '',
        addresses: [],
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(firestore, 'users', firebaseUser.uid), user);

      return {
        user,
        token: await firebaseUser.getIdToken(),
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  },

  async refreshToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      const userData = userDoc.data();

      const user: User = {
        id: currentUser.uid,
        email: currentUser.email!,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        phoneNumber: userData?.phoneNumber || '',
        profileImageUrl: currentUser.photoURL || '',
        addresses: userData?.addresses || [],
        isEmailVerified: currentUser.emailVerified,
        createdAt: userData?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      return {
        user,
        token: await currentUser.getIdToken(),
      };
    } catch (error: any) {
      throw new Error('Failed to refresh token');
    }
  },

  getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  },
};