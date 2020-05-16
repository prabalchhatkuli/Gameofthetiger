import React from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

export default function Navigation() {

        return(
            
            <Navbar collapseOnSelect expand="lg" bg="light " variant="light">
                <div className="container">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Button variant="outline-danger"  href='/game'>Play the Game </Button>{' '}
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
                     Game of the Tiger | बाघ चाल
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
                            <Button variant="outline-success" href='/login'>Log In/Sign Up</Button>{' '}
                        </Nav>
                    </Navbar.Collapse>
                    </div>
                </Navbar>
           
           );
}
