import React, { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import { auth, signInWithGoogle, generateUserDocument } from '../firebase.config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";

/**/
/*
class SignupPage

NAME

        SignupPage component - renders the signup page and handles all signup procedures

SYNOPSIS

        states:
          email, firstname, lastname, password, confirmPassword ->states for user information

DESCRIPTION

        This class will render the signup page with all the required html elements,
        it will also handle the signup procedure with firebase and receive an auth object from
        firebase authentication.

RETURNS

        no returns. generates auth object and saves it in the object in firebase.config.

AUTHOR

        Prabal Chhatkuli

DATE

        5/26/2020

*/
/**/
export default class SignupPage extends Component {
  /*
    NAME

        constructor - renders the signup page and handles all signup procedures

    DESCRIPTION

        This will initialize the states of the component and also bind the current
        object to all of the functions that will use the states.

  */
  constructor(props)
  {
    super(props);
    this.handleSignup = this.handleSignup.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange=this.handleConfirmPasswordChange.bind(this);
    this.handleFirstnameChange =this.handleFirstnameChange.bind(this);
    this.handleLastnameChange = this.handleLastnameChange.bind(this);

    this.state={
      email:'',
      firstname:'',
      lastname:'',
      password:'',
      confirmPassword:'',
    }
  }

  /**/
  /*
    Trivial function to handle changes in states:
      -handleEmailChange
      -handlePasswordChange
      -handleConfirmPasswordChange
      -handleFirstnameChange
      -handleLastnameChange
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

  handleConfirmPasswordChange(e)
  {
    this.setState({
      confirmPassword: e.target.value,
    })
  }

  handleFirstnameChange(e)
  {
    this.setState({
      firstname: e.target.value,
    })
  }

  handleLastnameChange(e)
  {
    this.setState({
      lastname: e.target.value,
    })
  }
  /************************************************* */

  /**/
  /*
  handleSignup(e)

  NAME

          handleSignup - handles signup for a new user

  SYNOPSIS

          async handleSignup(e)
              e     ->the event that caused the signup

  DESCRIPTION

          This function will confirm passwords, then create the new user on firebase,
          the auth object hence returned will be store in the firebase.config file.
          The function will also generate the user info document in firestore.

  RETURNS

          no returns. stores the auth object, then redirects the user to the landing page.

  AUTHOR

          Prabal Chhatkuli

  DATE

          4/25/2020

  */
  /**/
  async handleSignup(e)
  {
    //confirm both passwords are the same
    if(this.state.password!==this.state.confirmPassword)
    {
      alert("Both passwords must match");
      return;
    }
    e.preventDefault();

    //create the user
    const {user} = await createUserWithEmailAndPassword(auth, this.state.email, this.state.confirmPassword).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      return;
      // [END_EXCLUDE]
    });

    //create user document, on success
    await generateUserDocument(user, this.state.firstname, this.state.lastname, this.state.email);
    
    //redirect to the homepage
    window.location.href="/";
  }


  //render function for the component
  render() {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h3 className="mb-4 text-2xl font-semibold">Create an account with us</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="example@example.com" onChange={this.handleEmailChange} />
            <p className="text-sm text-muted-foreground">***We'll never share your info with anyone else.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="firstname">Firstname</Label>
            <Input id="firstname" type="text" placeholder="Lorem" onChange={this.handleFirstnameChange} />
            <Label htmlFor="lastname">Lastname</Label>
            <Input id="lastname" type="text" placeholder="Ipsum" onChange={this.handleLastnameChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Secret Password" onChange={this.handlePasswordChange} />
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="Retype same Password" onChange={this.handleConfirmPasswordChange} />
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={this.handleSignup}>Create an account</Button>
            <Button variant="outline" asChild><Link to="/login">Back to Login?</Link></Button>
          </div>
        </div>
      </div>
    );
  }
}