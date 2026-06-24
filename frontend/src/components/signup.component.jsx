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
      <main className="mx-auto flex max-w-md flex-col px-5 py-12 sm:py-16">
        <div className="heritage-card animate-rise p-7 sm:p-9">
          <p className="eyebrow mb-2">Join the hunt</p>
          <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Create your account</h1>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" onChange={this.handleEmailChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstname">First name</Label>
                <Input id="firstname" type="text" placeholder="First" onChange={this.handleFirstnameChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" type="text" placeholder="Last" onChange={this.handleLastnameChange} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" onChange={this.handlePasswordChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" onChange={this.handleConfirmPasswordChange} />
            </div>
            <Button onClick={this.handleSignup} size="lg" className="w-full rounded-full text-base">Create account</Button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    );
  }
}