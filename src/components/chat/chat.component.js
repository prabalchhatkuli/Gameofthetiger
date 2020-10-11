import React from "react";

/**/
/*
class Chat

NAME

        chat class - component for the chat boxes and related functions.

SYNOPSIS
        state:
            username        ->the chosen username
            message         ->currently typed message
            messages        ->list of messages for the chat

        props:
            socket          ->initialized socket passed from game component

DESCRIPTION
        This class will create a chat box component, which will send and receive message
        using the socket communication. It includes functions dedicated for better UI.

RETURNS
        Renders the chat box

AUTHOR

        Prabal Chhatkuli

DATE

        4/18/2020

*/
/**/
class Chat extends React.Component{
    constructor(props){
        super(props);
        console.log("constructor called");
        this.state = {
            username: '',
            message: '',
            messages: []
        };
        this.sendMessage=this.sendMessage.bind(this);
        this.updateScroll = this.updateScroll.bind(this);
    }

    /**/
    /*
    sendMessage()
    NAME

            sendMessage function - sends message to the socket

    SYNOPSIS

    DESCRIPTION
            Depending on the type of the box, whether it is a room chat or global, it will emit the 
            events to the respective chats

    RETURNS
            no return
    */
    /**/
    sendMessage = () => {
        if(this.props.name === 'Global')
        {
            this.props.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            });
        }
        else
        {
            this.props.socket.emit('SEND_MESSAGE_ROOM', {
                author: this.state.username,
                message: this.state.message,
                roomID:this.props.roomID
            });
        }
        this.setState({message: ''});
        this.updateScroll();

    }

    /*trivial key press function*/
    enterPressed(event) {
        var code = event.keyCode || event.which;
        if(code === 13) { //13 is the enter keycode
            this.sendMessage();
        } 
    }

    /**/
    /*
    componentDidMount()
    NAME

            componentDidMount function - in built react function: declares methods for the socket

    SYNOPSIS

    DESCRIPTION
            ComponentDidMount initializes "on" event listeners for the socket depending on whether the 
            chat is global or room chat

    RETURNS
            no return
    */
    /**/
    componentDidMount(){
        //this.socket = this.props.socket;
        console.log("socket created");

        if(this.props.name === 'Global')
        {
            this.props.socket.on('RECEIVE_MESSAGE', function(data){
                addMessage(data);
            });
            this.updateScroll();
        }
        else
        {
            this.props.socket.on('RECEIVE_MESSAGE_ROOM', function(data){
                addMessage(data);
            });
            this.updateScroll();
        }

        this.props.socket.on('PLAYER_NUMBER', function(data){
            addMessage({author:"SYSTEM",message:("You have been connected to the room. CODE("+ data+")")});
        })

        const addMessage = async data => {
            console.log(data);
            await this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
            this.updateScroll();
        };
        
    }
    
    /**trivial function to scroll to the bottom of the div */
    updateScroll(){
        var element = document.getElementById("chat-messages");
        element.scrollTop = element.scrollHeight;
    }

    render(){
        return (
            <div className="container">
                <div >
                    <div>
                        <div className="card">
                            <div className="card-body " >
                                <div className="card-title"><strong>{this.props.name}</strong> Chat</div>
                                <hr/>
                                <div id = "chat-messages" style={{overflow: "scroll", maxHeight:"30vh"}} className="messages">
                                    {this.state.messages.map(message => {
                                        this.updateScroll();
                                        return (
                                            <div><strong>{message.author}</strong>: {message.message}</div>
                                        );
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder="Screen Name" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/>
                                <br/>
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message}
                                 onKeyPress={this.enterPressed.bind(this)}
                                 onChange={ev => this.setState({message: ev.target.value})}/>
                                <br/>
                                <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;