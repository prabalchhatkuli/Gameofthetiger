import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import axios from 'axios';

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
recordAiGame(difficulty, side, result)
        Posts a single-player AI game result to the backend, authenticated with
        the current user's Firebase ID token. side = the human's side
        ('tiger'|'goat'); result = 'win' | 'loss'. No-op if not signed in.
*/
/**/
export const recordAiGame = async (difficulty, side, result) => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    await axios.post('/ai-game/result', { difficulty, side, result },
        { headers: { Authorization: `Bearer ${token}` } });
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
