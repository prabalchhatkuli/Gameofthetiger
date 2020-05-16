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
    this.handleLogin = this.handleLogin.bind(this);

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRemember = this.handleRemember.bind(this);

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
    console.log("login button clicked::::");
    //state has all login information along with remember option
    console.log(this.state);

    await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
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
    //console.log(firebase.auth().currentUser);
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
                  <Form.Label>FirstName</Form.Label>
                  <Form.Control type="text" placeholder="Lorem" />
                  <Form.Label>Lastname</Form.Label>
                  <Form.Control type="text" placeholder="Ipsum"/>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" placeholder="Secret Password"  onChange={this.handlePasswordChange} />
                  <Form.Label>Confirm Password:</Form.Label>
                  <Form.Control type="password" placeholder="Retype same Password" />
                </Form.Group>

                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check className="text-center" type="checkbox" label="Remember me"  onChange={this.handleRemember} />
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