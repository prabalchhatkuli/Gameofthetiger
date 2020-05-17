import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Link} from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";

export default class loginPage extends Component {

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


  async handleSignup(e)
  {
    if(this.state.password!==this.state.confirmPassword)
    {
      alert("Both passwords must match");
      return;
    }
    e.preventDefault();
    console.log("signup button clicked::::");

    await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.confirmPassword).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    console.log(firebase.auth().currentUser);
  }



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