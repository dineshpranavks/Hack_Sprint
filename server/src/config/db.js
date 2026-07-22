import { getFirestore, FieldValue as FirestoreFieldValue } from "firebase-admin/firestore";
import "./firebase.js";

let db = null;

export const getDb = () => {
  if (!db) {
    db = getFirestore();
  }
  return db;
};

export const FieldValue = FirestoreFieldValue;

export default getDb;