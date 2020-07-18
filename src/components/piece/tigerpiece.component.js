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
        //if odd
            //can go E/W/N/S except boundaries
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
            //----------------------------------------------------------------
            
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

            console.log("eamoves and moves");
            console.log(eatMoves);
            console.log(moves);
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
