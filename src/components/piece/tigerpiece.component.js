import Piece from "./piece.component";

export default class tigerpiece extends Piece{
    constructor(){
      super('T');
    }

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

    //tigers can move the same as goats but if a singular goat is blocking their way in one direction, they cannot move
    //
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
            let moves=[(src-6),(src-5), (src-4), (src-1), (src+1), (src+4), (src+5), (src+6)];
            //           src-12,src-10,  src-8,  src+2,  src-2,    src+8 ,   src+10, src+12
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
            let eatMoves=[(src-10), (src+2), (src-2), (src+10)] // for any of these moves to be possible there must be a goat in respective ones
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
            //----------------------------------------------------------------
            //if non-null moves element is a boundary element, turn the index at eatMoves to null
            for(let i=0; i<4; i++)
            {
              if(moves[i]!==null && ((moves[i]>=0&&moves[i]<=4)||(moves[i]>=20&&moves[i]<=24)||(moves[i]%4===0)||(moves[i]%5===0))){
                eatMoves[i]=null;
                if(board[moves[i]].player===null){
                  moves[i]=null;
                }
              }
            }

            if(eatMoves.includes(dest)){
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
}
