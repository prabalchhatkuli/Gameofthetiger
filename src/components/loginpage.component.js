import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import {auth} from '../firebase.config.js'
 
export default class loginPage extends Component {

  constructor(props)
  {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    // this.handleSignup = this.handleSignup.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRemember = this.handleRemember.bind(this);
    this.handleSignout = this.handleSignout.bind(this);

    this.state={
      email:'',
      password:'',
      remember:false
    }
  }

  handleEmailChange(e)
  {
    this.setState({
      email: e.target.value,
    })
  }

  handlePasswordChange(e)
  {
    this.setState({
      password: e.target.value,
    })
  }

  handleRemember(e)
  {
    this.setState({
      remember: e.target.value,
    })
  }

  async handleLogin(e)
  {
    e.preventDefault();

    await auth.signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    console.log(auth.currentUser);
  }

  
  // handleSignup(e)
  // {
  //   firebase.auth().onAuthStateChanged(function(user) {
  //     if (user) {
  //       console.log(user);
  //       // User is signed in.
  //     } else {
  //       console.log("not signed in");
  //     }
  //   });
  // }

  handleSignout(e)
  {
    auth.signOut();
  }

  render() {
    return (
      <div>
      <div>  
        <div className="container">  
            <div> <h3>Sign In</h3></div>
              <Form>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email"  onChange={this.handleEmailChange} />
                  <Form.Text className="text-muted">
                  ***We'll never share your info with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password"  onChange={this.handlePasswordChange} />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check className="text-center" type="checkbox" label="Remember me"  onChange={this.handleRemember} />
                </Form.Group>
                <Button className="center" variant="primary" onClick={this.handleLogin}>
                  Submit
                </Button>{' '}
                <Link to="/signup" className="btn btn-primary">
                   Don't have an Account? Wanna create an account?
                </Link>{' '}
                <Button className="center" variant="primary" onClick={this.handleSignout}>
                  Signout
                </Button> 
              </Form>
            </div>
         </div>
      </div>
    )
  }
}