// Access the global firebase object loaded via scripts in index.html
const firebase = (window as any).firebase;

const firebaseConfig = {
    apiKey: "AIzaSyConFpC-5IPOO8dxrYggy8JusWtC7BsgWs",
    authDomain: "lotacao-97c37.firebaseapp.com",
    projectId: "lotacao-97c37",
    databaseURL: "https://lotacao-97c37-default-rtdb.firebaseio.com",
    storageBucket: "lotacao-97c37.appspot.com",
    messagingSenderId: "782139851070",
    appId: "1:782139851070:web:dd2f3327c33a45f443ec6f"
};

let db: any;
let auth: any;

if (firebase) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    // Safety check: ensure database module is attached
    if (firebase.database) {
        db = firebase.database();
    } else {
        console.error("Firebase Database module not found.");
    }

    if (firebase.auth) {
        auth = firebase.auth();
    }
} else {
    console.error("Firebase SDK not loaded");
}

export { db, auth, firebase };