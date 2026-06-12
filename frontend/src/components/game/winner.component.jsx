import React, { Component, useContext,useState } from 'react'
import ReactDOM from 'react-dom'
import { UserContext } from "../../providers/UserProvider";
import { Redirect } from "react-router-dom";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import axios from 'axios';

/**/
/*
function Winner(props)

NAME

        function Winner - modal component to display the end of game

SYNOPSIS

        function Winner(props)
        props       ->props contains the winner of the game in props.winner

DESCRIPTION

        This function will display a modal with the winner of the game, the user cannot close the 
        modal. Instead, the user is redirected to the game page when they press "understood".

RETURNS

        a modal component, with a redirection button.

AUTHOR

        Prabal Chhatkuli

DATE

        6/7/2020

*/
/**/

export default function Winner(props) {
    const [show, setShow] = useState(true);

    //onclick function for the close button
    const handleClose = () => console.log("Tried to close modal");
  
    return (
      <>

        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Game Over!!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {props.winner=='T'?"Tiger":"Goat"} player is the winner of the game.
            Press understood to Redirect.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>{window.location.href="/game"}}>Understood</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }