import React, { Component } from 'react'
import io from "socket.io-client";
import './game.css';
import Board from './board.component'
import Tiger from '../piece/tigerpiece.component'
import Goat from '../piece/goatpiece.component'
import Piece from '../piece/piece.component'
import Chat from '../chat/chat.component'
//import fallenanimals from './fallenanimals.component'

class Game extends Component {
    constructor(props)
    {
        super(props);
        //this.changeColor = this.changeColor.bind(this);  Array(25).fill(new Piece())
        this.state ={
            history: [{
                squares: Array(25).fill(new Piece()),
            }],
            gisnext: true,
            sourceSelection:-1,
            currentBoard: Array(25).fill(null),
            destinationSelection:0,
            goatsOnBoard:0,//always <=20
            goatsTaken:0,
            status:'',
            socket:io('http://localhost:5000')
        };

        console.log(this.props);
        console.log("This is in the game component");
        console.log(localStorage);
    }
    
    //tigers start at the four corners of the board
    async componentDidMount(){
        let startstate = Array(25).fill(new Piece());
        startstate[0]=new Tiger();
        startstate[4]=new Tiger();
        startstate[20]=new Tiger();
        startstate[24]=new Tiger();
        //here over-rwriting the initial null board state with tigers built in
        this.setState({
            history: [{
                squares:startstate
            }]
          })
        

        //connect to the room
        this.state.socket.on("connect", function(data){
            this.state.socket.emit("join", this.props.roomID);
        }.bind(this));
        
        //componentdidmount will contain the information for emmitting and receiving moves
        this.state.socket.on('RECEIVE_MOVE', function(move){
            //console.log(move.gisnext);
            var temp_board = Array(25).fill(null);
            for(var i=0; i<move.boardState.length; i++)
            {
                if((move.boardState[i]).player === 'T')
                {
                    temp_board[i]=new Tiger()
                }
                else if((move.boardState[i]).player === 'G')
                {
                    temp_board[i]=new Goat()
                }
                else
                {
                    temp_board[i]=new Piece()
                }

                console.log((move.boardState[i]).player);
            }

            this.setState((state, props) => ({
                history: state.history.concat([{
                    squares: temp_board,
                }]),
                gisnext: move.gisnext,
                currentBoard: move.boardState,
                goatsOnBoard: move.goatsOnBoard,
                goatsTaken: move.goatsTaken
            }));
        }.bind(this));
    }

    //------------------------------------------------socket communications---------------------------------------------
    sendMoves(){
        //send the latest board positions
            //next player info
            //goats on board
            //goatsTaken
        let payload = {boardState:this.state.currentBoard,
                    goatsOnBoard:this.state.goatsOnBoard,
                    gisnext: this.state.gisnext,
                    goatsTaken: this.state.goatsTaken,
                    roomID: this.props.roomID}

        this.state.socket.emit('SEND_MOVE', payload);
        this.setState({message: ''});
    }

    connectToRoom = () => {
        this.state.socket.on("connect", data => {
          this.state.socket.emit("join", this.props.roomID);
        });

        this.state.socket.on("newMessage", data => {
          //getMessages();
          //function to receive messsages
        });

        //setInitialized(true);
      };

//----------------------------------------------------------handleClick()-------------------------------------------------
    async handleClick(i){
        const history =  this.state.history;
        const current = history[history.length-1];
        const squares = current.squares.slice();
        console.log("clicked "+ i);
        if(this.props.choice ==='multi')
        {
            console.log("multi engaged");
            if(this.props.playerPiece=='-')
            {
                this.setState(()=>({
                    status: "you are just an audience"
                }));
                return;
            }
            if(this.state.gisnext && this.props.playerPiece == 'tiger')
            {
                this.setState(()=>({
                    status: "it is not your turn"
                }));
                return;
            }
            else
            {
                if(!this.state.gisnext && this.props.playerPiece == 'goat')
                {
                    this.setState(()=>({
                        status: "it is not your turn"
                    }));
                    return;
                }
            }
        }
        //if source selection == -1
        if(this.state.sourceSelection===-1){
            //if clicked div has the piece that another player's piece is in
                //give status error
            if((squares[i].player==='T'&&this.state.gisnext) || (squares[i].player==='G'&&!this.state.gisnext))
            {
                this.setState(()=>({
                    status: "wrong piece to move"
                }));
                
                return;
            }

            //if clicked on unoccupied div: 
                //give status error
            if(this.state.gisnext)
            {
                if(squares[i].player===null){
                    //need to do something
                    //count g and if number is less than 20 continue
                    if(this.state.goatsOnBoard<20)
                    {
                        this.setState(()=>({
                            status: "goats placed"
                        }));
                        
                        squares[i]=new Goat();
                        this.setState((state, props)=>{
                            return {goatsOnBoard: state.goatsOnBoard+1};
                        });
                    }
                    else
                    {
                        this.setState(()=>({
                            status: "Already used all 20 goats"
                        }));    
                        return;
                    }
                }

                //try to move the goat
                else
                {
                    console.log(this.state.goatsOnBoard);
                    if(this.state.goatsOnBoard>=16)
                    {
                        this.setState((state, props)=>{
                            return {sourceSelection: i};
                        });
                        
                        this.setState(()=>({
                            status: ("source selected "+ i)
                        }));  
                    }
                    else
                    {
                        this.setState(()=>({
                            status: "place all 16 goats before moving"
                        })); 
                    }
                    return;
                }
            }
            //try to place a new tiger
            if(!this.state.gisnext)
            {
                if(squares[i].player===null)
                {
                    //clicked on incorrect place for tiger//give error
                    this.setState(()=>({
                        status: ("cannot place more than 4 tigers. Choose tiger first")
                    }));
                    return;
                }
                
                //try to move tiger
                //if clicked correct piece
                    //change the background color of the div : this is the source div
                    //change source selection to the index of the div
                if(squares[i].player==='T')
                {
                    this.setState((state, props)=>{
                        return {sourceSelection: i};
                    });
                    console.log("4");
                    return;
                }
            }
        }
        else{
        //if source selection is not -1 : player chose the destination
            //if source selection not -1 and the next div is the same
            //------need to change the backgroundn color back to what it was
            //do nothing

            if(this.state.sourceSelection===i)
            {
                //do nothing
                //don't change user
                this.setState((state, props)=>{
                    return {sourceSelection: -1};
                });

                this.setState(()=>({
                    status: "selection cancelled"
                })); 
                return;
            }
            
            //if null this will return false
            //const isDestEnemyOccupied = squares[i].player? true : false; 
            //check if the given move is possible, if possible, execute the move

             const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i,squares);

            //if move is possible execute
            //check if destination is valid is done in the object while calculating if move is
            if(isMovePossible){
                this.setState(()=>({
                    status: "Move possible"
                })); 
                let DoesTigerEat = Math.abs(this.state.sourceSelection-i)
                //if it is tiger's turn and whether it is trying to eat the goat
                if(!this.state.gisnext&&(DoesTigerEat===8||DoesTigerEat===2||DoesTigerEat===10||DoesTigerEat===12)){
                    squares[this.state.sourceSelection]=new Piece(); //remove old position
                    squares[i]=new Tiger(); //tiger in new position
                    squares[this.state.sourceSelection-(this.state.sourceSelection-i)/2]=new Piece(); //remove goat
                    this.setState((state, props)=>{
                        return {goatsTaken: state.goatsTaken+1};
                    })
                }
                else{
                    //if valid dest position of the piece
                    //switch the user: whoever will play next
                    //execute the move
                    squares[i]=this.state.gisnext? new Goat():new Tiger();
                    //remove the object in square[this.state.sourceSelection]
                    squares[this.state.sourceSelection]=new Piece();
                }
                this.setState((state, props)=>{
                    return {sourceSelection: -1};
                });

                this.setState(()=>({
                    status: ("destination selected: "+i)
                })); 
                //change user
            }
            else
            {
                this.setState(()=>({
                    status: "Move not Possible : destination is not empty: choose an empty destination"
                })); 
                return;
            }
        }

        //The game is over when either, the tigers capture five goats, or the goats have blocked the tigers from being able to move.
        if(this.state.goatsTaken ===5)
        {
            this.setState((state, props)=>{
                return {winner: 'T'};
            })
        }
        //check if all the tigers have been blocked
        var winCheckIndex = 0;
        var tigersBlocked = true; //flag variable
        for(winCheckIndex=0; winCheckIndex<25; winCheckIndex++)
        {
            if(squares[winCheckIndex].player==='T')
            {
                if(!squares[winCheckIndex].isTigerBlocked(winCheckIndex, squares)){   tigersBlocked=false; break;}
                else{   continue;}
            }
        }

        //if all tigers have been blocked: goat is the winner
        if(tigersBlocked)
        {
            this.setState((state, props)=>{
                return {winner: 'G'};
            })
        }

        //move possible so history is edited
        await this.setState((state, props) => ({
            history: state.history.concat([{
                squares: squares,
            }]),
            gisnext: !this.state.gisnext,
            currentBoard: squares
        }));
        //if game is multiplayer send moves
        if(this.props.choice==='multi'){
            this.sendMoves();
        }
    }
//---------------------------------------------------handleclick()----------------------------------------------------------
    render() {
        const history = this.state.history;
        const current = history[history.length -1];
        
        let nextPlayer;
        nextPlayer = 'Next player: ' + (this.state.gisnext ? 'Goat' : 'Tiger');
        let status = this.state.status;
        return (
            <div className="game">
                <div className="game-info">
                    <div>{nextPlayer}</div>
                    <div>{status}</div>
                    <ol>{/*add smth*/}</ol>
                </div>
                <div>
                        {/*get the main board*/}
                        <Board
                            squares={current.squares}
                            handleClick={(i)=> this.handleClick(i)}
                        />
                        {/*contains all the illustrated paths/click divs and diagonal elements.*/}
                </div>
                <Chat name="Room" roomID={this.props.roomID} socket={this.state.socket}/>
                {this.props.choice === 'multi'?
                 <Chat name="Global" socket={this.state.socket}/>:<p></p>
                }
            </div>
        )
    }
}

export default Game;