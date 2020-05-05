import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import './App.css'
//import goat from './SVG/goat.svg'
//import tiger from './SVG/tiger.svg'
import Navbar from './components/navbar.component'
import Landing from './components/landingpage.component'
//main component

function App() {
//<img src={goat} className="App-logo" alt="logo" />
        
//<img src={tiger} className="App-logo" alt="logo" />

  return (
    <Router>
      <Navbar/>
      <Route path="/" exact component={Landing}/>
    </Router>
    
  );
}

export default App;