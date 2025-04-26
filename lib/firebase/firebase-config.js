// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBOsk6EDki11fGUiGZlyasFoWisKrqIVVA",
  authDomain: "park-it-rent-it.firebaseapp.com",
  projectId: "park-it-rent-it",
  storageBucket: "park-it-rent-it.appspot.com",
  messagingSenderId: "603429257402",
  appId: "1:603429257402:web:fe99bc8d57cfbdc63e0283",
  measurementId: "G-SGHEK83C40",
  databaseURL: "https://park-it-rent-it-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
