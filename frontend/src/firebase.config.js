import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Configuration to connect to firebase
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Initialize analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
export { analytics };

// Set session persistence
setPersistence(auth, browserSessionPersistence);

// Provider for Google sign-in
const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => {
    return signInWithPopup(auth, provider);
};

/**/
/*
generateUserDocument()

NAME

        generateUserDocument - creates firestore document

SYNOPSIS

        generateUserDocument = (user, firstname, lastname, email) => {
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

export const generateUserDocument = async (user, firstname, lastname, email) => {
    if (!user) return;
    // Create a user reference and retrieve the user
    const userRef = doc(firestore, `users/${user.uid}`);
    const snapshot = await getDoc(userRef);
    let wins = 0;
    let losses = 0;

    // Create/set the document into the firestore
    if (!snapshot.exists()) {
        try {
            await setDoc(userRef, {
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
    // Retrieve user info, and save it in a document
    try {
        const userRef = doc(firestore, `users/${uid}`);
        const userDocument = await getDoc(userRef);
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
setWinLoss

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
export const setWinLoss = async (win, loss, uid) => {
    const userRef = doc(firestore, `users/${uid}`);
    // atomic server-side increment; no read-modify-write race
    await updateDoc(userRef, {
        wins: increment(win),
        losses: increment(loss)
    });
};
