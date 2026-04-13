import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuhbFJDx0mdxkX_QRLlQmOJyNkbDDOoio",
  authDomain: "book-a-call-ee1be.firebaseapp.com",
  projectId: "book-a-call-ee1be",
  storageBucket: "book-a-call-ee1be.firebasestorage.app",
  messagingSenderId: "988570044670",
  appId: "1:988570044670:web:5748c886203715aaed3daf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
