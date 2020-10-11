import React,{ useContext } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css'
import Navbar from './components/navbar.component'
import Landing from './components/landingpage.component'
import GameChoice from './components/gamechoice.component'
import LoginPage from './components/loginpage.component'
import InstructPage from './components/instruction.component'
import AboutPage from './components/about.component'
import Signup from './components/signup.component'
import GameRoom from './components/chat/gameroom.component'
import Profile from './components/profile.component'

import { UserContext } from "./providers/UserProvider";

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

function App(props) {
  //retrieve user object
  const user = useContext(UserContext);

  //returns a router with all main components
  return (
    <Router>
      <Navbar userInfo={user}/>
      <Switch>
        <Route path="/" exact render={(props) => (
                  <Landing {...props} userInfo={user}/>
                )}/>

        <Route path="/game" render={(props) => (
                  <GameChoice {...props} userInfo={user}/>
                )}/>
    
        <Route path="/login" render={(props) => (
                  <LoginPage {...props} />
                )}/>
        <Route path="/instruction" render={(props) => (
                  <InstructPage {...props} />
                )}/>
        <Route path="/about" component={AboutPage}/>
        <Route path="/signup" render={(props) => (
                  <Signup {...props} />
                )}/>
        <Route path="/profile" render={(props) => (
                  <Profile {...props} userInfo={user}/>
                )}/>
        <Route path="/room/:roomID" render={(props) => (
                  <GameRoom {...props}  userInfo={user}/>
                )}/>
      </Switch>
    </Router>
  );
}

export default App;