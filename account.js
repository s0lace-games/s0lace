import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* --------------------------
   ELEMENTS
-------------------------- */
const loginEmail = document.getElementById("login-email");
const loginPass = document.getElementById("login-pass");
const loginBtn = document.getElementById("login-btn");

const signupEmail = document.getElementById("signup-email");
const signupPass = document.getElementById("signup-pass");
const signupName = document.getElementById("signup-name");
const signupBtn = document.getElementById("signup-btn");

const logoutBtn = document.getElementById("logout-btn");

const statusBox = document.getElementById("account-status");
const userBox = document.getElementById("user-info");

/* --------------------------
   LOGIN
-------------------------- */
loginBtn?.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const pass = loginPass.value.trim();

  if (!email || !pass) return alert("Fill in email + password.");

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

/* --------------------------
   SIGNUP
-------------------------- */
signupBtn?.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const pass = signupPass.value.trim();
  const name = signupName.value.trim();

  if (!email || !pass || !name) return alert("Fill every field.");

  try {
    // Create account
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    // Set Display Name
    await updateProfile(user, {
      displayName: name
    });

    // Create User Profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      created: Date.now(),
      theme: localStorage.getItem("s0laceTheme") || "dark",
      accent: localStorage.getItem("s0laceAccent") || "green",
      bgMode: localStorage.getItem("s0laceBgMode") || "default"
    });

  } catch (err) {
    alert("Signup failed: " + err.message);
  }
});

/* --------------------------
   LOGOUT
-------------------------- */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

/* --------------------------
   AUTO SYNC
-------------------------- */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    statusBox.textContent = "Logged in";
    logoutBtn.style.display = "inline-block";

    // Show user info
    userBox.innerHTML = `
      <div>UID: ${user.uid}</div>
      <div>Name: ${user.displayName || "None"}</div>
      <div>Email: ${user.email}</div>
    `;

    // Pull Firestore settings if exist
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      // OPTIONAL: Sync their settings to your site instantly
      if (data.theme) window.S0LACE.applyTheme(data.theme, true);
      if (data.accent) window.S0LACE.applyAccent(data.accent, true);
      if (data.bgMode) window.S0LACE.applyBackground(data.bgMode, "", true);
    }
  } else {
    statusBox.textContent = "Not signed in";
    logoutBtn.style.display = "none";
    userBox.innerHTML = "";
  }
});
