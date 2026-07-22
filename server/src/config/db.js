import initFirebase from './firebase.js';

// TODO: Initialize Firestore Database instance from Firebase Admin SDK
let db = null;

export const getDb = () => {
  if (!db) {
    const admin = initFirebase();
    if (admin.apps.length) {
      db = admin.firestore();
    }
  }
  return db;
};

export default getDb;
