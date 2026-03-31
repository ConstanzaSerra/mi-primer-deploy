import admin from "firebase-admin";
//import * as serviceAccount from "./key.json";

import dotenv from "dotenv";
dotenv.config();

console.log(
  "ENV length: ",
  process.env.FIREBASE_APPLICATION_CREDENTIALS_JSON?.length,
);
// Configuración de Firebase usando las variables de entorno
const serviceAccount = JSON.parse(
  process.env.FIREBASE_APPLICATION_CREDENTIALS_JSON!,
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://apx-dwf-m6-a7b40-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();
const rtdb = admin.database();

export { firestore, rtdb };
