import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css'
//import goat from './SVG/goat.svg'
//import tiger from './SVG/tiger.svg'
import Navbar from './components/navbar.component'
import Landing from './components/landingpage.component'
import GamePage from './components/game/gamecomponent'
import LoginPage from './components/loginpage.component'
//main component

function App() {
//<img src={goat} className="App-logo" alt="logo" />
        
//<img src={tiger} className="App-logo" alt="logo" />

  return (
    <Router>
      
        <Navbar/>
        <Route path="/" exact component={Landing}/>
        <Route path="/game" component={GamePage}/>
        <Route path="/login" component={LoginPage}/>
    </Router>
    
  );
}

export default App;