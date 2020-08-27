import React,{ useContext } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css'
//import goat from './SVG/goat.svg'
//import tiger from './SVG/tiger.svg'

import Navbar from './components/navbar.component'
import Landing from './components/landingpage.component'
import GameChoice from './components/gamechoice.component'
import LoginPage from './components/loginpage.component'
import InstructPage from './components/instruction.component'
import AboutPage from './components/about.component'
import Signup from './components/signup.component'


import UserProvider from "./providers/UserProvider";
import { UserContext } from "./providers/UserProvider";
//main component

function App(props) {
//<img src={goat} className="App-logo" alt="logo" />
        
//<img src={tiger} className="App-logo" alt="logo" />
  const user = useContext(UserContext);
  return (
    <Router>
      <div>
      {user? <h1>{user.email}</h1>:<h1></h1>}
      {console.log(user)}
      </div>
        <Navbar/>
      <Switch>
        <Route path="/" exact component={Landing}/>
        <Route path="/game" render={(props) => (
                  <GameChoice {...props} />
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
      </Switch>
    </Router>
  );
}

export default App;