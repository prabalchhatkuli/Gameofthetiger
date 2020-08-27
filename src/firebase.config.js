import firebase from 'firebase/app';
import  "firebase/firestore";
import 'firebase/auth';
import { functions } from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyAodmLV_kdY2r8SZXOPZfNYPcIL5dHRpCg",
    authDomain: "gameoftiger-1f3fa.firebaseapp.com",
    databaseURL: "https://gameoftiger-1f3fa.firebaseio.com",
    projectId: "gameoftiger-1f3fa",
    storageBucket: "gameoftiger-1f3fa.appspot.com",
    messagingSenderId: "930356002076",
    appId: "1:930356002076:web:b999e3de49de83e2de4ed9",
    measurementId: "G-QM7LVVXDF4"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};


export const generateUserDocument = async (user, firstname, lastname,email) => {
  if (!user) return;
  
  const userRef = firestore.doc(`users/${user.uid}`);
  console.log("ok to here");
  const snapshot = await userRef.get();
  
  if (!snapshot.exists) {
    //const { email, displayName, photoURL } = user;
    try {
      await userRef.set({
        firstname,
        lastname,
        email,
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
  return getUserDocument(user.uid);
};

const getUserDocument = async uid => {
  if (!uid) return null;
  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();

    return {
      uid,
      ...userDocument.data()
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};