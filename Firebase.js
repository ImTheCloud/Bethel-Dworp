import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAx8gg5UxEjavy6GQBHxPjOCATYzwQDjRM",
    authDomain: "bethel-dworp.firebaseapp.com",
    projectId: "bethel-dworp",
    storageBucket: "bethel-dworp.appspot.com",
    messagingSenderId: "517127730345",
    appId: "1:517127730345:web:9e18539bb205b8efc565b8"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

const firestore = firebase.firestore();

export { firestore };
