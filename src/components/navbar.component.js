import React,{useContext} from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import {auth} from '../firebase.config.js'

/**/
/*
function Navigation(props)

NAME

        Navigation - the navigation bar component for the application

SYNOPSIS

        export default function Navigation(props)
            props       --> props contains the user object sent from the App component

DESCRIPTION

        provides a gui at the top of the page for accessing the various routes of the program,
        inlcuding the sign-in/out and the play game functionality.

RETURNS

        Returns navigation bar gui

AUTHOR

        Prabal Chhatkuli

DATE

        2/24/2020

*/
/**/

export default function Navigation(props) {

        //trivial function for the signout button
        function signout()
        {
            auth.signOut();
        }

        //elements returned by the component
        return(
            
            <Navbar collapseOnSelect expand="lg" bg="light " variant="light">
                <div className="container">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Button variant="outline-success"  href='/game'>Play the Game </Button>{' '}
                            <Nav.Link href="/instruction">Instruction</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>

                    <Navbar.Brand className = "p" href="/"> 
                        <img
                        alt=""
                        src={require('../SVG/goat.svg')}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        />{' '}
                     Game of the Tiger
                     {' '}
                     <img
                        alt=""
                        src={require('../SVG/tiger.svg')}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        />
                     </Navbar.Brand>

                    <Navbar.Collapse id="responsive-navbar-nav">
                        
                        <Nav className="ml-auto">
                            <Nav.Link href="/about">About</Nav.Link>{' '}
                            {props.userInfo === null?
                                <div></div>:<Nav.Link href="/Profile">Profile</Nav.Link>
                            }
                            {props.userInfo === null?
                                <Button variant="outline-success" href='/login'>Log In/Sign Up</Button>
                                :
                                <Button variant="outline-danger" onClick={signout}>Signout </Button>
                            }{' '}
                        </Nav>
                    </Navbar.Collapse>
                    </div>
                </Navbar>
           
           );
}
