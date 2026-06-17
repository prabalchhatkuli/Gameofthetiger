import React, { Component } from 'react'
import { getUserDocument} from '../firebase.config.js';

/**/
/*
class Profile

NAME

        Profile component - renders the profile of the authenticated user

SYNOPSIS
        props       -> receives the user object as a props
        states:
          name, email, wins , losses ->states for user information

DESCRIPTION

        This class will render the Profile for the user. The user profile will contain
        information from the firestore. The information is retrieved using the uid of the 
        user object userInfo received as props.

RETURNS

        no returns. renders the profile with all information

AUTHOR

        Prabal Chhatkuli

DATE

        3/27/2020

*/
/**/
export default class Profile extends Component {
    //constructor for the component for initalizing states
    constructor(props)
    {
        super(props);
        this.state = {
            name:'',
            email:'',
            wins:0,
            losses:0
        }
    }

    /**/
    /*
    componentDidUpdate(prevprops)

    NAME

            componentDidUpdate - built in function of React which runs on update of the ReactDOM

    DESCRIPTION

            This class will retrieve user information using the function getUserDocument from
            the firestore, using the uid from userInfo. it will then set the states to the 
            information from firestore to update the DOM.

    RETURNS

            no returns. renders the profile with all information

    AUTHOR

            Prabal Chhatkuli

    DATE

            3/27/2020

    */
    /**/
    async componentDidUpdate(prevprops)
    {
        if(this.props.userInfo !==prevprops)
        {
            //retrieve the doc
            var document = await getUserDocument(this.props.userInfo.uid)
            
            //setStates
            this.setState((state, props)=>{
                return {name:document.firstname + " "+document.lastname,
                email: document.email,
                wins: document.wins,
                losses: document.losses}
            })
        }
    }

    //render method for the component
    render() {
        
        return (
            <div className="container">
                <div className = "container">
                    <h2>Player Info</h2>
                    <hr/>
                    <h5>Name: {this.state.name}</h5>
                    <h5>Email: {this.state.email}</h5>
                    <h5>Total wins: {this.state.wins}</h5>
                    <h5>Total losses: {this.state.losses}</h5>
                </div>
            </div>
        )
    }
}
