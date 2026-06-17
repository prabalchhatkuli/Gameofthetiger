/**/
/*
class Piece

NAME

        Piece - parent class for all the pieces in the game

SYNOPSIS

        this.player         --> contains whether the piece is tiger / goat / nothing(null)

DESCRIPTION

        This class is the parent class of the tiger and goat pieces. However, it also exists
        independently as a null piece that is always in any position of the board. This class 
        is extended to the tiger and goat classes.

RETURNS

        no returns. only sets the value of the player variable

AUTHOR

        Prabal Chhatkuli

DATE

        4/26/2020

*/
/**/

export default class Piece {
    constructor(player){
        //if the player is not provided, it is just an empty piece on the board
        if(player===undefined)
        {
            this.player=null;
        }
        else    //it is a real piece with secondary properties: see Tiger, Goat components
        {
            this.player = player;
        }
    }
  }