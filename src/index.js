import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'react-redux'

import store from './config/store'
//-------------------------------------------------------------firebase------------------------------
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
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
firebase.initializeApp(firebaseConfig);

//------------------------------------------------------------firebase----------------------------------

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
