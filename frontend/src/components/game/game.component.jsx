import React, { Component } from 'react'
import io from "socket.io-client";
import './game.css';
import Board from './board.component'
import Tiger from '../piece/tigerpiece.component'
import Goat from '../piece/goatpiece.component'
import Piece from '../piece/piece.component'
import Chat from '../chat/chat.component'
import Winner from './winner.component'
import { auth, recordAiGame } from '../../firebase.config'
import { getAIMove } from '../../ai/index'
import { applyMove, getWinner } from '../../ai/rules'

/**/
/*
class Game

NAME

        Game class - class that stores the process for the game

SYNOPSIS

        states: 
            history ->history of moves,
            gisnext   ->whether the goat player is next,
            sourceSelection         ->the selected source of move
            destinationSelection    ->selected destination of move
            goatsOnBoard    ->number of goats on board
            goatsTaken      ->number of goats eaten by tigers
            winner          -> the winner of the game
            socket          ->socket for communication of the moves and messages

DESCRIPTION

        The game class is the monolith for the whole application, it stores all the information of the game.
        FUrthermore, it gives instructions on what to do during a click. It also establishes socket communications.
        It encompasses the game logic in the handleClick function

RETURNS

        Returns the game component.

AUTHOR

        Prabal Chhatkuli

DATE

        5/10/2020

*/
/**/

class Game extends Component {
    /**/
    /*
    constructor

    NAME

            constructor for game class

    SYNOPSIS

            props       -> contains the gamechoice, userInfo, roomID, playerPiece

    DESCRIPTION

            creates the socket for communication and initalizes the states.
    */
    /**/
    constructor(props)
    {
        super(props);
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
            winner:null,
            status:'',
            aiThinking:false,
            aiResultRecorded:false,
            socket:io('/', {
                auth: (cb) => {
                    // called on every (re)connect; sends a fresh ID token
                    if (auth.currentUser) {
                        auth.currentUser.getIdToken().then(token => cb({ token }));
                    } else {
                        cb({});
                    }
                }
            })
        };
    }
    
    /**/
    /*
    applyMoveToState(move)
            Applies a move object (place|move|capture) to the board via the pure
            rules engine and updates component state. Shared AI move path.
    */
    /**/
    applyMoveToState(move){
        const current = this.state.history[this.state.history.length - 1];
        const result = applyMove(current.squares, move, {
            gisnext: this.state.gisnext,
            goatsOnBoard: this.state.goatsOnBoard,
            goatsTaken: this.state.goatsTaken
        });
        const winner = getWinner(result.board, result.goatsTaken);
        this.setState(state => ({
            history: state.history.concat([{ squares: result.board }]),
            currentBoard: result.board,
            goatsOnBoard: result.goatsOnBoard,
            goatsTaken: result.goatsTaken,
            gisnext: result.gisnext,
            winner: winner,
            status: winner ? (winner === 'T' ? 'Tiger Player is the winner' : 'Goat Player is the winner') : this.state.status
        }), () => {
            if (winner && this.props.choice === 'single' && !this.state.aiResultRecorded) {
                this.setState({ aiResultRecorded: true });
                const humanWon = (winner === 'T' && this.props.playerSide === 'tiger') ||
                                 (winner === 'G' && this.props.playerSide === 'goat');
                recordAiGame(this.props.difficulty, this.props.playerSide, humanWon ? 'win' : 'loss')
                    .catch(err => console.error('recordAiGame failed:', err));
            }
        });
    }

    /**/
    /*
    componentDidUpdate
            In single-player, when it becomes the AI's turn and the game is not
            over, compute and apply an AI move after a short delay.
    */
    /**/
    componentDidUpdate(){
        if (this.props.choice !== 'single') return;
        if (this.state.winner) return;
        if (this.state.aiThinking) return;

        const aiGisnext = this.props.aiSide === 'goat';
        if (this.state.gisnext !== aiGisnext) return;

        this.setState({ aiThinking: true });
        setTimeout(() => {
            const current = this.state.history[this.state.history.length - 1];
            const move = getAIMove(current.squares, this.props.aiSide, {
                gisnext: this.state.gisnext,
                goatsOnBoard: this.state.goatsOnBoard,
                goatsTaken: this.state.goatsTaken
            }, this.props.difficulty);
            if (move) this.applyMoveToState(move);
            this.setState({ aiThinking: false });
        }, 400);
    }

    /**/
    /*
    componentDidMount

    NAME

            componentDidMount function - inbuilt react function that starts before the rendering

    SYNOPSIS
            async componentDidMount()

    DESCRIPTION

            sets the initial state for the game, starts socket communication by joining to the room.
            Determines actions for events generated by the connection.

    */
    /**/
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
            //if the winner is determined, confirm it to the server, which
            //records win/loss once both players have reported
            if(move.winner)
            {
                this.state.socket.emit('GAME_OVER', {roomID: this.props.roomID, winner: move.winner});
            }
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
                goatsTaken: move.goatsTaken,
                winner: move.winner
            }));
        }.bind(this));
    }

    /**/
    /*
    sendMoves()

    NAME

            sendMoves sendMoves - sends move to socket in multiplayer games

    SYNOPSIS
            sendMoves(){

    DESCRIPTION

            sends the information of the user and the actions of a user, which is saved in the states
            to another user listening on the socket.

    */
    /**/
    sendMoves(){
        //if the winner is determined, report it to the server, which
        //records win/loss once both players have reported
        if(this.state.winner)
        {
            this.state.socket.emit('GAME_OVER', {roomID: this.props.roomID, winner: this.state.winner});
        }

        //send the latest board positions
        let payload = {boardState:this.state.currentBoard,
                    goatsOnBoard:this.state.goatsOnBoard,
                    gisnext: this.state.gisnext,
                    goatsTaken: this.state.goatsTaken,
                    roomID: this.props.roomID,
                    winner: this.state.winner}

        this.state.socket.emit('SEND_MOVE', payload);
        this.setState({message: ''});
    }

    /**/
    /*
    handleClick()

    NAME

            sendMoves sendMoves - sends move to socket in multiplayer games

    SYNOPSIS
             async handleClick(i)
             i              -> the position/square that the user has clicked on

    DESCRIPTION

           depending on the click of the user, this function determines the start and end positions
           for a certain piece and evaluates the user's decisions. It uses the functions of the pieces
           to determine whether moves are possible or not. It also evaluates the winner after the end of
           a user's turn.

    */
    /**/
    /*----------------------------------------------------------handleClick()-------------------------------------------------*/
    async handleClick(i){
        if(this.state.winner)
        {
            this.setState(()=>({
                status: "Game Over!! "+this.state.winner+ " player is the winner"
            }));
            return;
        }
        //creating an instance of the board and storing it in squares
        const history =  this.state.history;
        const current = history[history.length-1];
        const squares = current.squares.slice();

        if(this.props.choice === 'single'){
            const humanGisnext = this.props.playerSide === 'goat';
            if(this.state.gisnext !== humanGisnext || this.state.aiThinking){
                this.setState({ status: 'Wait for the computer to move' });
                return;
            }
        }

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
                    if(this.state.goatsOnBoard>=20)
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
                            status: "place all 20 goats before moving"
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
                    await this.setState((state, props)=>{
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
        if(this.state.goatsTaken === 5)
        {
            await this.setState((state, props)=>{
                return {winner: 'T', status:'Tiger Player is the winner'};
            })
        }
        else
        {
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
                await this.setState((state, props)=>{
                    return {winner: 'G', status:'Goat Player is the winner'};
                })
            }
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
/*---------------------------------------------------handleclick() ends----------------------------------------------------------*/
    render() {
        const history = this.state.history;
        const current = history[history.length -1];
        
        let nextPlayer;
        nextPlayer = 'Next player: ' + (this.state.gisnext ? 'Goat' : 'Tiger');
        let status = this.state.status;
        return (
            <div>
                <div className="game-info">
                    <div>{nextPlayer}</div>
                    <div>Goats: placed: {this.state.goatsOnBoard}</div>
                    <div>Eaten: {this.state.goatsTaken}</div>
                    <div>{status}</div>
                    {this.state.winner?<Winner winner={this.state.winner}/>:<p></p>}
                </div>
                <div className="game">

                    <div>
                            {/*get the main board*/}
                            <Board
                                squares={current.squares}
                                handleClick={(i)=> this.handleClick(i)}
                            />
                            {/*contains all the illustrated paths/click divs and diagonal elements.*/}
                    </div>
                </div>
                <div className="chat">
                {this.props.choice === 'multi'?
                    <Chat name="Room" roomID={this.props.roomID} socket={this.state.socket}/>:<p></p>
                }
                <Chat name="Global" socket={this.state.socket}/>
                </div>
            </div>
        )
    }
}

export default Game;