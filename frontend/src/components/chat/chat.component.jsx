import React from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**/
/*
class Chat
        Chat box component. Sends/receives messages over the socket. The "Global"
        instance uses the global events; any other name uses the room events.
        props: name, socket, roomID
*/
/**/
class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: []
        };
        this.listRef = React.createRef();   // scroll container (avoids duplicate-id getElementById)
        this.sendMessage = this.sendMessage.bind(this);
        this.updateScroll = this.updateScroll.bind(this);
    }

    /**/
    /*
    sendMessage()
            Emits the typed message on the global or room channel depending on
            this.props.name, then clears the input.
    */
    /**/
    sendMessage = () => {
        const text = this.state.message.trim();
        if (!text) return;

        if (this.props.name === 'Global') {
            this.props.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            });
        } else {
            this.props.socket.emit('SEND_MESSAGE_ROOM', {
                author: this.state.username,
                message: this.state.message,
                roomID: this.props.roomID
            });
        }
        this.setState({ message: '' });
    }

    /*trivial key press function*/
    enterPressed(event) {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 is the enter keycode
            this.sendMessage();
        }
    }

    /**/
    /*
    componentDidMount()
            Registers the socket listeners for incoming messages (global or room)
            and the player-number system message.
    */
    /**/
    componentDidMount() {
        if (this.props.name === 'Global') {
            this.props.socket.on('RECEIVE_MESSAGE', function (data) {
                addMessage(data);
            });
        } else {
            this.props.socket.on('RECEIVE_MESSAGE_ROOM', function (data) {
                addMessage(data);
            });
        }

        this.props.socket.on('PLAYER_NUMBER', function (data) {
            addMessage({ author: "SYSTEM", message: ("You have been connected to the room. CODE(" + data + ")") });
        })

        const addMessage = async data => {
            await this.setState({ messages: [...this.state.messages, data] });
        };
    }

    // scroll to the newest message whenever the list grows
    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length !== this.state.messages.length) {
            this.updateScroll();
        }
    }

    /**trivial function to scroll the message list to the bottom */
    updateScroll() {
        const el = this.listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }

    render() {
        const { messages } = this.state;
        return (
            <div className="heritage-card animate-rise flex h-80 flex-col p-4">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2">
                    <h2 className="font-display text-base font-semibold">
                        <span className="text-primary">{this.props.name}</span> chat
                    </h2>
                    <span className="text-xs text-muted-foreground">{messages.length} msg</span>
                </div>

                {/* Messages */}
                <div ref={this.listRef} className="-mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
                    {messages.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
                    ) : (
                        messages.map((message, index) => (
                            message.author === 'SYSTEM' ? (
                                <p key={index} className="py-1 text-center text-xs italic text-muted-foreground">{message.message}</p>
                            ) : (
                                <div key={index} className="rounded-lg bg-muted/70 px-3 py-1.5">
                                    <span className="text-xs font-semibold text-primary">{message.author || 'anon'}</span>
                                    <p className="text-sm leading-snug break-words">{message.message}</p>
                                </div>
                            )
                        ))
                    )}
                </div>

                {/* Composer */}
                <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                    <Input
                        type="text"
                        placeholder="Screen name"
                        value={this.state.username}
                        onChange={ev => this.setState({ username: ev.target.value })}
                        className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Message…"
                            value={this.state.message}
                            onKeyPress={this.enterPressed.bind(this)}
                            onChange={ev => this.setState({ message: ev.target.value })}
                            className="h-9 flex-1 text-sm"
                        />
                        <Button onClick={this.sendMessage} className="h-9 shrink-0">Send</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;
