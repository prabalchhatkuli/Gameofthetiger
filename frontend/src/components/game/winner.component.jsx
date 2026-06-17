import React, { Component, useContext,useState } from 'react'
import { UserContext } from "../../providers/UserProvider";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
      <Dialog open={show}>
        <DialogContent onInteractOutside={(e)=>e.preventDefault()} onEscapeKeyDown={(e)=>e.preventDefault()} className="[&>button]:hidden">
          <DialogHeader><DialogTitle>Game Over!!</DialogTitle></DialogHeader>
          <p>{props.winner=='T' ? 'Tiger' : 'Goat'} player is the winner of the game. Press understood to continue.</p>
          <DialogFooter>
            <Button variant="default" onClick={()=>{ window.location.href="/game"; }}>Understood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }