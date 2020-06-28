export default class Piece {
    constructor(player){
        if(player===undefined)
        {
            this.player=null;
        }
        else
        {
            this.player = player;
        }
    }
  }