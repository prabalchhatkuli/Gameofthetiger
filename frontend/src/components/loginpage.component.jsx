import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import {auth} from '../firebase.config.js'
 
/**/
/*
class LoginPage

NAME

        LoginPage component - renders the signup page and handles all signup procedures

SYNOPSIS

        states:
          email, password, remember ->states for user information

DESCRIPTION

        This class will render the login page with all the required html elements,
        it will also handle the login procedures with firebase and retrieve the auth object

RETURNS

        no returns. gets the auth object and saves it in the firebase.config file.

AUTHOR

        Prabal Chhatkuli

DATE

        5/26/2020

*/
/**/
export default class LoginPage extends Component {

  constructor(props)
  {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRemember = this.handleRemember.bind(this);
    this.enterPressed = this.enterPressed.bind(this);

    this.state={
      email:'',
      password:'',
      remember:false
    }
  }
  
  /**/
  /*
    Trivial function to handle changes in states:
      -handleEmailChange
      -handlePasswordChange
      -handleRemember
      -enterPressed
  */
  /**/
  /************************************************* */
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

  enterPressed(event) {
    //calls the handlelogin function when user enters "enter"
    var code = event.keyCode || event.which;
    if(code === 13) { //13 is the enter keycode
        this.handleLogin();
    } 
  }
  /************************************************* */

  /**/
  /*
  handleLogin(e)

  NAME

          handleLogin - handles login for a existing user

  SYNOPSIS

          async handleLogin(e)
              e     ->the event that caused the login

  DESCRIPTION

          This function will send a authentication request to firebase. Assumes the user is already created.
          Then, it redirects the authenticated user to the homepage/landing.

  RETURNS

          no returns. stores the auth object, then redirects the user to the landing page.

  AUTHOR

          Prabal Chhatkuli

  DATE

          4/25/2020

  */
  /**/
  async handleLogin(e)
  {
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
    
    //redirect to the homepage on success
    window.location.href="/";
  }

  //render function for the component
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
                  <Form.Control type="password" placeholder="Password" onKeyPress={this.enterPressed.bind(this)} onChange={this.handlePasswordChange} />
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
              </Form>
            </div>
         </div>
      </div>
    )
  }
}