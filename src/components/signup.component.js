import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import { auth, signInWithGoogle, generateUserDocument } from '../firebase.config.js';

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
    const {user} = await auth.createUserWithEmailAndPassword(this.state.email, this.state.confirmPassword).catch(function(error) {
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
      <div>
      <div>  
        <div className="container">  
            <div> <h3>Create an account with us</h3></div>
              <Form>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="example@example.com"  onChange={this.handleEmailChange} />
                  <Form.Text className="text-muted">
                    ***We'll never share your info with anyone else.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Firstname:</Form.Label>
                  <Form.Control type="text" placeholder="Lorem" onChange={this.handleFirstnameChange}/>
                  <Form.Label>Lastname:</Form.Label>
                  <Form.Control type="text" placeholder="Ipsum" onChange={this.handleLastnameChange}/>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" placeholder="Secret Password"  onChange={this.handlePasswordChange} />
                  <Form.Label>Confirm Password:</Form.Label>
                  <Form.Control type="password" placeholder="Retype same Password" onChange={this.handleConfirmPasswordChange}/>
                </Form.Group>

                <Button className="center" variant="primary" onClick={this.handleSignup}>
                  Create an account
                </Button>{' '}
                <Link to="/login" className="btn btn-primary">
                   Back to Login?
                </Link>
              </Form>
            </div>
         </div>
      </div>
    )
  }
}