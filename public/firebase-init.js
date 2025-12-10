// firebase.js (MODULE FILE)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDZ9RpsmhIb6wMXCmysScNqfGY4K0Y3GvQ",
  authDomain: "s0lace.firebaseapp.com",
  projectId: "s0lace",
  storageBucket: "s0lace.firebasestorage.app",
  messagingSenderId: "987787551956",
  appId: "1:987787551956:web:ffc45e1cc11b0bee34c741",
  measurementId: "G-W79F0ZGEPN"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
