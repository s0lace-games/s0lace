// account.js
import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

//
// DOM
//
const loginEmail = document.getElementById("login-email");
const loginPass = document.getElementById("login-pass");
const signupEmail = document.getElementById("signup-email");
const signupPass = document.getElementById("signup-pass");

const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

const statusBox = document.getElementById("account-status");

//
// LOGIN
//
loginBtn.addEventListener("click", async () => {
  let email = loginEmail.value.trim();
  let pass = loginPass.value.trim();

  if (!email || !pass) {
    statusBox.textContent = "Missing fields.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    statusBox.textContent = "Logged in!";
  } catch (err) {
    statusBox.textContent = err.message;
  }
});

//
// SIGNUP
//
signupBtn.addEventListener("click", async () => {
  let email = signupEmail.value.trim();
  let pass = signupPass.value.trim();

  if (!email || !pass) {
    statusBox.textContent = "Missing fields.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    statusBox.textContent = "Account created!";
  } catch (err) {
    statusBox.textContent = err.message;
  }
});

//
// AUTO LOGIN SYNC
//
onAuthStateChanged(auth, user => {
  if (user) {
    statusBox.textContent = "Logged in as " + user.email;
    localStorage.setItem("s0laceUser", user.uid);

    // redirect back to homepage automatically
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  } else {
    localStorage.removeItem("s0laceUser");
  }
});
