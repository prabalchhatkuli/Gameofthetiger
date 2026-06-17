import React, { Component } from 'react'
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import {auth} from '../firebase.config.js'
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 
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
    await signInWithEmailAndPassword(auth, this.state.email, this.state.password).catch(function(error) {
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
      <div className="mx-auto max-w-md px-4 py-6">
        <h3 className="mb-4 text-2xl font-semibold">Sign In</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="Enter email" onChange={this.handleEmailChange} />
            <p className="text-sm text-muted-foreground">***We'll never share your info with anyone else.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" onKeyPress={this.enterPressed.bind(this)} onChange={this.handlePasswordChange} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" onChange={this.handleRemember} /> Remember me
          </label>
          <div className="flex gap-2">
            <Button variant="default" onClick={this.handleLogin}>Submit</Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Don't have an Account? Create one</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}