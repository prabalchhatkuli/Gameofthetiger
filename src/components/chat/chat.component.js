import React from "react";

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
    }

    sendMessage = ev => {
        ev.preventDefault();
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

    }

    componentDidMount(){
        //this.socket = this.props.socket;
        console.log("socket created");

        if(this.props.name === 'Global')
        {
            this.props.socket.on('RECEIVE_MESSAGE', function(data){
                addMessage(data);
            });
        }
        else
        {
            this.props.socket.on('RECEIVE_MESSAGE_ROOM', function(data){
                addMessage(data);
            });
        }

        this.props.socket.on('PLAYER_NUMBER', function(data){
            addMessage({author:"SYSTEM",message:("You have been connected to the room. CODE("+ data+")")});
        })

        const addMessage = data => {
            console.log(data);
            this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
        };
        
    }

    render(){
        return (
            <div className="container">
                <div className="row">
                    <div className="col-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">{this.props.name} Chat</div>
                                <hr/>
                                <div className="messages">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div><strong>{message.author}</strong>: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder="Username" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/>
                                <br/>
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
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