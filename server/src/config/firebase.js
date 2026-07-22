import { initializeApp, getApps, cert } from "firebase-admin/app";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("[Firebase Admin Config]: Successfully initialized with serviceAccountKey.json");
  } catch (err) {
    console.error("[Firebase Admin Config Error]:", err.message);
  }
}

export default getApps()[0];