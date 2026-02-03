// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTF5M7HcFIvF_TbFqpG7zMjh29AXP1zzM",
  authDomain: "lotacao-753a1.firebaseapp.com",
  databaseURL: "https://lotacao-753a1-default-rtdb.firebaseio.com",
  projectId: "lotacao-753a1",
  storageBucket: "lotacao-753a1.firebasestorage.app",
  messagingSenderId: "755549088369",
  appId: "1:755549088369:web:6182fc39adbd73ea4789d0",
  measurementId: "G-3KWB2PQMCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
