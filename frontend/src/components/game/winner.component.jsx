import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
    const [show] = useState(true);

    return (
      <Dialog open={show}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden text-center"
        >
          <div className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-3xl">
            {props.winner == 'T' ? '🐯' : '🐐'}
          </div>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              {props.winner == 'T' ? 'Tigers win!' : 'Goats win!'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {props.winner == 'T' ? 'The tigers captured their prey.' : 'The goats cornered every tiger.'}
          </p>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => { window.location.href = "/game"; }}
              size="lg"
              className="rounded-full px-8"
            >
              Play again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
