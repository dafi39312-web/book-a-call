// ╔═══════════════════════════════════════════════════════╗
// ║  ISTRUZIONI: Sostituisci i valori sotto con i tuoi  ║
// ║  Li trovi su Firebase Console → Impostazioni progetto ║
// ╚═══════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "INCOLLA_QUI_LA_TUA_API_KEY",
  authDomain: "INCOLLA_QUI.firebaseapp.com",
  projectId: "INCOLLA_QUI_IL_PROJECT_ID",
  storageBucket: "INCOLLA_QUI.appspot.com",
  messagingSenderId: "INCOLLA_QUI",
  appId: "INCOLLA_QUI"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
