import React, { Component, createContext } from "react";
import { auth } from "../firebase.config";

export const UserContext = createContext({ user: null});

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