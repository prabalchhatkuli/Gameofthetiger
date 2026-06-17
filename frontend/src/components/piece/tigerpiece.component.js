import Piece from "./piece.component";

/**/
/*
class Tigerpiece

NAME

        Tigerpiece - class for the tiger piece in the game

SYNOPSIS

        findBoundaries    ->determine boundaries for move
        isTigerBlocked    ->determine if tiger is able to move
        isMovePossible    ->determine if certain move is possible

DESCRIPTION

        This class describes the properties of the tiger piece. It decribes its movement patterns,
        loss patterns, etc. it also find the boundaries around the edges and corners of the board 
        for a tiger.

RETURNS

        tiger object

AUTHOR

        Prabal Chhatkuli

DATE

        3/18/2020

*/
/**/

export default class Tigerpiece extends Piece{
    constructor(){
      super('T');
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
    isTigerBlocked(src, board)

    NAME

            isTigerBlocked function - function to determine if a tiger has any moves possible

    SYNOPSIS

            isTigerBlocked(src, board)
            board         -> the overall arragement of the board 
            src           -> source point where the tiger is located

    DESCRIPTION

            determines if the tiger has any moves possible or not. It does this by finding all possible moves.
            Then if at least one move is possible the tiger is not blocked.

    RETURNS

            true or false: depending on whether the moves of the tiger is blocked or not.

    AUTHOR

            Prabal Chhatkuli

    DATE

            2/24/2020

    */
    /**/
    isTigerBlocked(src, board)
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
        //if even can go all sides except boundaries
        let moves=[];
        let eatMoves=[];
        if(evenOrOdd)
        {
            moves=[(src-6),(src-5), (src-4), (src-1), (src+1), (src+4), (src+5), (src+6)];
            eatMoves= [(src-12),(src-10), (src-8), (src-2), (src+2), (src+8), (src+10), (src+12)];
            //top
            if(boundaries[0]){ 
              moves[0]=null;
              moves[1]=null;
              moves[2]=null;
              eatMoves[0]=null;
              eatMoves[1]=null;
              eatMoves[2]=null;
            }
            //left
            if(boundaries[1]){
              moves[0]=null;
              moves[3]=null;
              moves[5]=null;
              eatMoves[0]=null;
              eatMoves[3]=null;
              eatMoves[5]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
              moves[4]=null;
              moves[7]=null;
              eatMoves[2]=null;
              eatMoves[4]=null;
              eatMoves[7]=null;
            }
            
            //bottom
            if(boundaries[3]){
              moves[5]=null;
              moves[6]=null;
              moves[7]=null;
              eatMoves[5]=null;
              eatMoves[6]=null;
              eatMoves[7]=null;
            }
        }
        //if odd can go E/W/N/S except boundaries
        else
        {
            moves=[(src-5), (src-1), (src+1), (src+5)];
            eatMoves=[(src-10), (src-2), (src+2), (src+10)] // for any of these moves to be possible there must be a goat in respective moves
            //top
            if(boundaries[0]){
              moves[0]=null;
              eatMoves[0]=null;
            }
            //left
            if(boundaries[1]){
              moves[1]=null;
              eatMoves[1]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
              eatMoves[2]=null;
            }
            //bottom
            if(boundaries[3]){
              moves[3]=null;
              eatMoves[3]=null;
            }
        }
        
        for(let i=0; i<moves.length; i++)
            {
              //check if a goat is present in the box, if not cannot jump over

              if(moves[i]===null)
              {
                continue;
              }
    
              if(board[moves[i]].player==='T')
              {
                eatMoves[i]=null;
                moves[i]=null;
              }
              
              //if goat is present then cannot move in the next but can eat
              else if(board[moves[i]].player==='G')
              {
                moves[i]=null;
              }
              
              //if move space is empty, can move into but cannot eat/jump over
              else if(board[moves[i]].player===null)
              {
                eatMoves[i]=null;
              }

              //if there is another piece in the eatmove place already
              if(eatMoves[i]!==null){
                //undefined check is done because sometimes eatMoves[i] may contain indexes that are not defined
                if(board[eatMoves[i]]===undefined||board[eatMoves[i]].player!==null){
                  eatMoves[i]=null;
                }
              }

              //check if the move is into the boundary, if yes, cannot jump over, 
              if(moves[i]!==null &&((moves[i]>=0&&moves[i]<=4)||(moves[i]>=20&&moves[i]<=24)||(moves[i]%4===0)||(moves[i]%5===0))){
                //but, if the tiger is in the boundary it can move in a direction :eatMoves not null
                if(!((src>=0&&src<=4)||(src>=20&&src<=24)||(src%4===0)||(src%5===0))){
                  eatMoves[i]=null;
                }
              }

            }

          
            let allPossibleMoves = eatMoves.concat(moves);
            let empty = true;
            var i;
            //if tiger is blocked, then both eatMoves and moves have null elements
            for (i=0; i<allPossibleMoves.length; i++) {
              if (allPossibleMoves[i] !== null) {
                empty = false;
                break;
              }
            }

            return empty;
    }

    /**/
    /*
    isMovePossible(src, dest, board)

    NAME

            isMovePossible function - function to determine if a proposed move is possible

    SYNOPSIS

            isMovePossible(src, dest, board)
            board         -> the overall arragement of the board 
            src           -> source point where the tiger is located
            dest          -> the destination proposed by the user

    DESCRIPTION

            The function determines all possible moves of the tiger including the ones
             where the tiger can eat a goat. Then determines whether the proposed move is included
             in the possible move

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
        //if even can go all sides except boundaries
        let moves=[];
        let eatMoves=[];
        if(evenOrOdd)
        {
            moves=[(src-6),(src-5), (src-4), (src-1), (src+1), (src+4), (src+5), (src+6)];
            eatMoves= [(src-12),(src-10), (src-8), (src-2), (src+2), (src+8), (src+10), (src+12)];
            //top
            if(boundaries[0]){ 
              moves[0]=null;
              moves[1]=null;
              moves[2]=null;
              eatMoves[0]=null;
              eatMoves[1]=null;
              eatMoves[2]=null;
            }
            //left
            if(boundaries[1]){
              moves[0]=null;
              moves[3]=null;
              moves[5]=null;
              eatMoves[0]=null;
              eatMoves[3]=null;
              eatMoves[5]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
              moves[4]=null;
              moves[7]=null;
              eatMoves[2]=null;
              eatMoves[4]=null;
              eatMoves[7]=null;
            }
            
            //bottom
            if(boundaries[3]){
              moves[5]=null;
              moves[6]=null;
              moves[7]=null;
              eatMoves[5]=null;
              eatMoves[6]=null;
              eatMoves[7]=null;
            }
        }
        //if odd can go E/W/N/S except boundaries
        else
        {
            moves=[(src-5), (src-1), (src+1), (src+5)];
            eatMoves=[(src-10), (src-2), (src+2), (src+10)] // for any of these moves to be possible there must be a goat in respective ones
            //top
            if(boundaries[0]){
              moves[0]=null;
              eatMoves[0]=null;
            }
            //left
            if(boundaries[1]){
              moves[1]=null;
              eatMoves[1]=null;
            }
            //right
            if(boundaries[2]){
              moves[2]=null;
              eatMoves[2]=null;
            }
            //bottom
            if(boundaries[3]){
              moves[3]=null;
              eatMoves[3]=null;
            }
        }
        console.log("length of moves");
        console.log(eatMoves);
        console.log(moves);
        for(let i=0; i<moves.length; i++)
            {
              //check if a goat is present in the box, if not cannot jump over
              if(moves[i]===null)
              {
                continue;
              }
    
              if(board[moves[i]].player==='T')
              {
                eatMoves[i]=null;
                moves[i]=null;
              }
              
              //if goat is present then cannot move in the next but can eat
              else if(board[moves[i]].player==='G')
              {
                moves[i]=null;
              }
              
              //if move space is empty, can move into but cannot eat/jump over
              else if(board[moves[i]].player===null)
              {
                eatMoves[i]=null;
              }

              //if there is another piece in the eatmove place already
              if(eatMoves[i]!==null){
                //undefined check is done because sometimes eatMoves[i] may contain indexes that are not defined
                if(board[eatMoves[i]]===undefined||board[eatMoves[i]].player!==null){
                  eatMoves[i]=null;
                }
              }

              //check if the move is into the boundary, if yes, cannot jump over, 
              if(moves[i]!==null &&((moves[i]>=0&&moves[i]<=4)||(moves[i]>=20&&moves[i]<=24)||(moves[i]%4===0)||(moves[i]%5===0))){
                //but, if the tiger is in the boundary it can move in a direction :eatMoves not null
                if(!((src>=0&&src<=4)||(src>=20&&src<=24)||(src%4===0)||(src%5===0))){
                  eatMoves[i]=null;
                }
              }

            }

            //if eat possible
            if(eatMoves.includes(dest)&&board[dest].player===null){
              return true;
            }
            //----------------------------------------------------------------
            //moves has the position of possible moves, has null on the list
            //ensure destination is empty
            else if(moves.includes(dest) && board[dest].player===null){
              return true;
            }
            else
            {
              return false;
            }
    }
}
