import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar.component';
import Landing from './components/landingpage.component';
import GameChoice from './components/gamechoice.component';
import LoginPage from './components/loginpage.component';
import InstructPage from './components/instruction.component';
import AboutPage from './components/about.component';
import Signup from './components/signup.component';
import GameRoom from './components/chat/gameroom.component';
import Profile from './components/profile.component';

import { UserContext } from "./providers/UserProvider";
import { getUserDocument } from './firebase.config';
import { DEFAULT_AVATAR } from './avatars';

/**/
/*
App(props)

NAME

        App - Starts the top level of the application

SYNOPSIS

        App(props)
            props             --> properties it may have recieved from parent(can be null)

DESCRIPTION

        This function starts the react app. It intializes the router to various endpoints of the app
        This function also provides the user object to all other components of the applicaiton

RETURNS

        returns a dom object with the react router elements, switch, and their respective elements

AUTHOR

        Prabal Chhatkuli

DATE

        05/21/2020

*/
/**/

function App() {
  // Retrieve user object
  const user = useContext(UserContext);

  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  useEffect(() => {
    let active = true;
    if (user) {
      getUserDocument(user.uid).then(doc => {
        if (active && doc && doc.avatar) setAvatar(doc.avatar);
      });
    } else {
      setAvatar(DEFAULT_AVATAR);
    }
    return () => { active = false; };
  }, [user]);

  // Returns a router with all main components
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar userInfo={user} avatar={avatar} />
      <Routes>
        <Route path="/" element={<Landing userInfo={user} />} />
        <Route path="/game" element={<GameChoice userInfo={user} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/instruction" element={<InstructPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile userInfo={user} avatar={avatar} onAvatarChange={setAvatar} />} />
        <Route path="/room/:roomID" element={<GameRoom userInfo={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
