import React from 'react';
import goat from './SVG/goat.svg'
import tiger from './SVG/tiger.svg'
import './App.css'
//main component

function App() {
  return (
    <body>
      <div id="maindiv">
        <div id='frontpicture'>
         
          <img src={goat} className="App-logo" alt="logo" />
        
          <img src={tiger} className="App-logo" alt="logo" />
        
        </div>
        <div id='startdiv'>
          start game here
        </div>
      </div>
    </body>
  );
}

export default App;
