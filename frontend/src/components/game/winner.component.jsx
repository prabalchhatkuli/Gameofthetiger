import React, { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
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

        Displays a non-dismissible game-over dialog and fires a celebratory
        confetti burst in the winning side's colour (saffron for tigers,
        indigo for goats). The user is redirected to the game page on "Play again".

RETURNS

        a modal component, with a redirection button.

AUTHOR

        Prabal Chhatkuli

DATE

        6/7/2020

*/
/**/

const TIGER_COLORS = ['#d15a09', '#f3753c', '#f7b686', '#fff7ed'];
const GOAT_COLORS = ['#184b89', '#3a6db5', '#a1b8c9', '#eef3f8'];

/**/
/*
celebrate(winner)
        Fires a short confetti animation tinted to the winning side. Two angled
        bursts from the lower corners plus a centre pop, over ~1.6s.
*/
/**/
function celebrate(winner) {
    const colors = winner === 'T' ? TIGER_COLORS : GOAT_COLORS;
    const end = Date.now() + 1600;

    confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 }, colors, scalar: 1.05 });

    (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

export default function Winner(props) {
    const [show] = useState(true);
    const isTiger = props.winner == 'T';

    // celebratory animation on game over
    useEffect(() => {
        celebrate(props.winner);
    }, [props.winner]);

    return (
      <Dialog open={show}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden overflow-hidden text-center"
        >
          {/* glow accent behind the emblem */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${isTiger ? 'bg-primary/30' : 'bg-accent/30'}`}
          />
          <div className="winner-pop mx-auto mb-2 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-4xl">
            {isTiger ? '🐯' : '🐐'}
          </div>
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-center">
              {isTiger ? 'Tigers win!' : 'Goats win!'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isTiger ? 'The tigers captured their prey.' : 'The goats cornered every tiger.'}
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
