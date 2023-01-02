import Firebase from "firebase";
import Admin from "firebase-admin";

import { log } from "../logger";

// Initialize Firebase Admin SDK
Admin.initializeApp({}, process.env.FIREBASE_ADMIN_APP_NAME);

// Initialize Firebase Client SDK
Firebase.initializeApp({
    apiKey: process.env.FIREBASE_APP_API_KEY,
    authDomain: process.env.FIREBASE_APP_AUTH_DOMAIN,
},                     process.env.FIREBASE_APP_NAME);

log(false, "firebase/initialize", "system", "Firebase initialized");
