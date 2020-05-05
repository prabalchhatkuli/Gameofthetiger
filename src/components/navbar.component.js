import React from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

export default function Navigation() {

        return(
            <Navbar collapseOnSelect expand="lg" bg="primary " variant="dark">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="/play">Play</Nav.Link>
                            <Nav.Link href="/instruction">Instruction</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>

                    <Navbar.Brand href="/"> 
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
                            <Nav.Link href="/about">About</Nav.Link>
                            <Nav.Link href="/login">Sign in</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
           );
}
