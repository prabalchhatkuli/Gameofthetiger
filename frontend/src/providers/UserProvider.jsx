import React, { Component, createContext } from "react";
import { auth } from "../firebase.config";

//generate a context for the user
export const UserContext = createContext({ user: null});

/**/
/*
UserProvider
NAME

        UserProvider class - class for the user object from authentication

SYNOPSIS
        user                  ->user object originally set to null(indicating no sign in)
        constructor()         -> evaluates all passed props
        componentDidMount()   ->  sets the user authentication object to the UserContext, before the constructor is called

DESCRIPTION

        This class is a wrapper for the auth object from firebase authentication.
        It will help us retrieve the authentication information, when needed.

RETURNS

        no returns. renders the children props

AUTHOR

        Prabal Chhatkuli

DATE

        6/12/2020

*/
/**/
class UserProvider extends Component {
    constructor(props){
        super(props);
        this.state = {
        user: null,
        email:null,
        username:null
        };
    }

  componentDidMount = () => {
    auth.onAuthStateChanged(userAuth => {
      this.setState({ user: userAuth});
    });
  };

  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
export default UserProvider;