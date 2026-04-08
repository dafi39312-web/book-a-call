import { db } from "./firebase";
import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "firebase/firestore";

/* ── BLOCKS (indisponibilità) ── */
export const subscribeBlocks = (callback) => {
  const q = query(collection(db, "blocks"), orderBy("date"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const saveBlock = async (block) => {
  await setDoc(doc(db, "blocks", String(block.id)), block);
};

export const removeBlockDb = async (id) => {
  await deleteDoc(doc(db, "blocks", String(id)));
};

/* ── BOOKINGS (prenotazioni) ── */
export const subscribeBookings = (callback) => {
  const q = query(collection(db, "bookings"), orderBy("createdAt"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const saveBooking = async (booking) => {
  await setDoc(doc(db, "bookings", String(booking.id)), booking);
};
