import firebase from 'firebase/app';
import  "firebase/firestore";
import 'firebase/auth';
import { functions } from "firebase";

//constant for storing configuration to connect to firebase
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

//initialize firebase/firestore/authentication using the configuration
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

//provider for google sign-in
const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

/**/
/*
generateUserDocument()

NAME

        generateUserDocument - creates firestore document

SYNOPSIS

        generateUserDocument = (user, firstname, lastname,email) => {
            user             --> the user information
            firstname, lastname        --> firstname and lastname from signup
            email           --> email of the user

DESCRIPTION

        This function will asynchronously generate a firestore document from the provided
        information. In addition, it will connect the firestore with the uid
        of the firebase authentication.

RETURNS

        Returns a document with user information.

AUTHOR

        Prabal Chhatkuli

DATE

        9/2/2020

*/
/**/

export const generateUserDocument = async (user, firstname, lastname,email) => {
  if (!user) return;
  //create a user reference and retrieve the user
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  let wins=0;
  let losses =0;

  //create/set the document into the firestore
  if (!snapshot.exists) {
    try {
      await userRef.set({
        firstname,
        lastname,
        email,
        wins,
        losses
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
  return getUserDocument(user.uid);
};

/**/
/*
getUserDocument

NAME

        getUserDocument - get user document from firestore

SYNOPSIS

        getUserDocument = async uid => {
            uid             --> the user authentication object

DESCRIPTION

        This function will asynchronously retrieve a user information from firestore

RETURNS

        Returns a document with user information.

AUTHOR

        Prabal Chhatkuli

DATE

        9/2/2020

*/
/**/
export const getUserDocument = async uid => {
  if (!uid) return null;
  //retrieve user info, and save it in a document
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

/**/
/*
getUserDocument

NAME

        setWinLoss - update the win/loss numbers in the user document in firestore

SYNOPSIS

        setWinLoss = async(win, loss, uid) => {
            uid             --> the user authentication object
            win, loss             --> flags for whether the user won/loss the game

DESCRIPTION

        This function will asynchronously retrieve a user information from firestore,
        then update it with the new number of win and loss. This will be retrieved from
        the two arguments provided to the function

RETURNS

        no returns

AUTHOR

        Prabal Chhatkuli

DATE

        9/2/2020

*/
/**/
export const setWinLoss = async(win, loss, uid) =>{
  //get the document
  let docObject = await firestore.doc(`users/${uid}`);
  //retrieve intial user info
  const userDocument = await firestore.doc(`users/${uid}`).get();
  //update
  const res = await docObject.update({
    wins: userDocument.data().wins + win,
    losses: userDocument.data().losses + loss
  })
}