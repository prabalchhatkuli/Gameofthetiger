import Piece from "./piece.component";

/**/
/*
class Goatpiece

NAME

        Goatpiece - class for the goat piece in the game

SYNOPSIS

        findBoundaries    ->determine boundaries for move
        isMovePossible    ->determine if certain move is possible

DESCRIPTION

        This class describes the properties of the goat piece. It decribes its movement patterns,
        loss patterns, etc. it also find the boundaries around the edges and corners of the board 
        for a goat.

RETURNS

        tiger object

AUTHOR

        Prabal Chhatkuli

DATE

        3/18/2020

*/
/**/

export default class Goatpiece extends Piece{
    constructor(player){
        super('G');
      }
    
    /**/
    /*
    findBoundaries(evenOrOdd, src)

    NAME

            findBoundaries function - function to find boundaries in the board

    SYNOPSIS

            findBoundaries(evenOrOdd, src)
            evenOrOdd     -> if a tiger is in an even position or a odd position
            src           -> source point where the tiger is located

    DESCRIPTION

            This class find the boundary of the board, this is necessary to determine
            if a possible move is blocked because of a boundary in the board.

    RETURNS

            an array of four objects, each determining whether each side of the board is blocked or open

    AUTHOR

            Prabal Chhatkuli

    DATE

            3/18/2020

    */
    /**/
    findBoundaries(evenOrOdd, src){
        //boundaries in the order: T, L, R, B
        let boundaries=Array(4).fill(false);
        //top boundary
        if(0<=src && src<=4){
            //top boundary set
            boundaries[0]=true;
        }
        //left boundary
        if(src%5===0){
            //left boundary set
            boundaries[1]=true;
        }
        //right boundary
        if(src%5===4)
        {
            //right boundary set
            boundaries[2]=true;
        }
        //bottom boundary
        if(20<=src && src<=24)
        {
            //bottom boundary set
            boundaries[3]=true;
        }
        return boundaries;
    }

    /**/
    /*
    isMovePossible(src, dest, board)

    NAME

            isMovePossible function - function to determine if a proposed move is possible

    SYNOPSIS

            isMovePossible(src, dest, board)
            board         -> the overall arragement of the board 
            src           -> source point where the goat is located
            dest          -> the destination proposed by the user

    DESCRIPTION

            The function determines all possible moves of the goat. The goat can only move to an empty destination
            unlike the tiger that can jump over a goat to reach a blocked location.

    RETURNS

            true or false: depending on whether the move is possible

    AUTHOR

            Prabal Chhatkuli

    DATE

            2/24/2020

    */
    /**/
    isMovePossible(src, dest, board)
    {   
        //check source number
            //even or odd
            //true if even, false if odd
            let evenOrOdd = false;
            if(src%2===0)
            {
                evenOrOdd=true;
            }
        //find boundaries
        let boundaries=this.findBoundaries(evenOrOdd, src);
        console.log(boundaries);
        //if even
            //can go all sides except boundaries
        if(evenOrOdd)
        { 
          //moves has the position of possible moves, contains null elements
            let moves=[(src-6),(src-5), (src-4), (src-1), (src+1), (src+4), (src+5), (src+6)];
            //top
            if(boundaries[0]){ 
              moves[0]=null;
              moves[1]=null;
              moves[2]=null;
            }
            //left
            if(boundaries[1]){
              moves[0]=null;
              moves[3]=null;
              moves[5]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
              moves[4]=null;
              moves[7]=null;
            }
            //bottom
            if(boundaries[3]){
              moves[5]=null;
              moves[6]=null;
              moves[7]=null;
            }
            //ensure destination is empty
            if(moves.includes(dest) && board[dest].player===null){
              return true;
            }
            else
            {
              return false;
            }
        }
        //if odd
            //can go E/W/N/S except boundaries
        else
        {
            let moves=[(src-5), (src-1), (src+1), (src+5)];
            //top
            if(boundaries[0]){
              moves[0]=null;
            }
            //left
            if(boundaries[1]){
              moves[1]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
            }
            //bottom
            if(boundaries[3]){
              moves[3]=null;
            }

            //ensure destination is empty
            if(moves.includes(dest) && board[dest].player===null){
              return true;
            }
            else
            {
              return false;
            }
        }
    }
}
