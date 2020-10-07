import Piece from "./piece.component";

export default class goatpiece extends Piece{
    constructor(player){
        super('G');
      }
//--------------------------------------------------------check possible moves---------------------------
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

    //goats cannot be blocked in any way
    //do not jump or do anything
    //need to lookup the original state before making decision
    //the square needs to be globally available to both goat/tiger/game component
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
