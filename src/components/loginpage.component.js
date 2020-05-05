import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import './App.css'
//import goat from './SVG/goat.svg'
//import tiger from './SVG/tiger.svg'

//main component

function App() {
//<img src={goat} className="App-logo" alt="logo" />
        
//<img src={tiger} className="App-logo" alt="logo" />

  return (
    <Router>
      <body>
      <div>  
      <div className="container">
            <div className="container">
            <div className="container">
            <div> <h3>SignUp Component </h3></div>
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
              </Form.Group>
              <Form.Group controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
            </div>
            </div></div>
         </div>
        </body>
        </Router>
    
  );
}

export default App;