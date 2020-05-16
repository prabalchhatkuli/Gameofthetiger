import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css'
//import goat from './SVG/goat.svg'
//import tiger from './SVG/tiger.svg'
import Navbar from './components/navbar.component'
import Landing from './components/landingpage.component'
import GamePage from './components/game/game.component'
import LoginPage from './components/loginpage.component'
import InstructPage from './components/instruction.component'
import AboutPage from './components/about.component'
import Signup from './components/signup.component'

//main component

function App() {
//<img src={goat} className="App-logo" alt="logo" />
        
//<img src={tiger} className="App-logo" alt="logo" />

  return (
    <Router>
        <Navbar/>
      <Switch>
        <Route path="/" exact component={Landing}/>
        <Route path="/game" component={GamePage}/>
        <Route path="/login" component={LoginPage}/>
        <Route path="/instruction" component={InstructPage}/>
        <Route path="/about" component={AboutPage}/>
        <Route path="/signup" component={Signup}/>
      </Switch>
    </Router>
    
  );
}

export default App;