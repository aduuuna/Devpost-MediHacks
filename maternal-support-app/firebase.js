// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDR0vI-gfpWQmP-EzGJPLltyktfN0TmjOU",
  authDomain: "maternal-system-support.firebaseapp.com",
  projectId: "maternal-system-support",
  storageBucket: "maternal-system-support.firebasestorage.app",
  messagingSenderId: "574944696822",
  appId: "1:574944696822:web:d2c77559d8b5052656cfd7",
  measurementId: "G-9JXPKNGSE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };