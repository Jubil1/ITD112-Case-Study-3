// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAODcQHUXXJg9qNvN-i0P0H68k_3c-mTbQ",
  authDomain: "filipinoemigrantsdb-6a5fa.firebaseapp.com",
  projectId: "filipinoemigrantsdb-6a5fa",
  storageBucket: "filipinoemigrantsdb-6a5fa.firebasestorage.app",
  messagingSenderId: "899839312350",
  appId: "1:899839312350:web:4e4270342b5edde1281d4f",
  measurementId: "G-18SQJX3J7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);