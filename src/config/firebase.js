// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFmvMeBaiH0EsEIIWfr6vQgBC7SxC0wsA",
  authDomain: "moviebookingsystem-9876b.firebaseapp.com",
  projectId: "moviebookingsystem-9876b",
  storageBucket: "moviebookingsystem-9876b.firebasestorage.app",
  messagingSenderId: "36952126490",
  appId: "1:36952126490:web:73cefcb0494d3511f74da3",
  measurementId: "G-S8FVK1D9PN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);