import React, { Component, useContext } from 'react'
import { UserContext } from "../../providers/UserProvider";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { auth } from "../../firebase.config";

/**/
/*
class Multichoice

NAME

        Multichoice class - starts process for a multiplayer game

SYNOPSIS

        state:
            modalShow       ->flag for modal view
            playerPiece        ->the piece that the player wants to play with
            linkId              ->the id of the game room
            setRedirect         ->flag for redirecting to the room
            userInfo            ->the user object from firebase



DESCRIPTION
        The component create a modal and asks for user to input the piece they want to play with.
        Also, a game room can be generated. Once game is created they can join the game. There is also
        the option to join the game using an already created link.


RETURNS
        UI component

AUTHOR

        Prabal Chhatkuli

DATE

        9/12/2020

*/
/**/

export default class Multichoice extends Component {
    constructor(props){
        super(props);
        this.state={modalShow:true, playerPiece:null, linkId:null, setRedirect:false, userInfo: this.props.userInfo, generateResult: null, joinLink: ''};
        this.onCloseButtonClick =  this.onCloseButtonClick.bind(this);
        this.onGenerateButtonClick =  this.onGenerateButtonClick.bind(this);
        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.setPlayerPiece = this.setPlayerPiece.bind(this);
        this.createGame = this.createGame.bind(this);
    }

    /*trivial function for close button click*/
    onCloseButtonClick(e)
    {
        this.setState({
            modalShow: false,
          })

          //rederect to the gameChoice page
          window.location.href="/game"
    }

    /*trivial function to set the player piece*/
    setPlayerPiece(event) {
        this.setState({
            playerPiece: event.target.value,
          })

        //set local player information
        var playerInfo = {creator:true, playerPiece:this.state.playerPiece, linkId:this.state.linkId};
        localStorage.setItem("playerInfo", JSON.stringify(playerInfo));

        console.log(event.target.value);
    }

    /**/
    /*
    onGenerateButtonClick()

    NAME

            onGenerateButtonClick function - get a unique room number

    DESCRIPTION
            This component communicates with the server to generate a unique room number.
            on response, the DOM is updated with the received information.

    RETURNS
            sets the state of LinkID to the received response from the server.

    */
    /**/
    async onGenerateButtonClick(event){
        console.log("Generating randomly generated link");
        let payload={piece:this.state.playerPiece};
        try
        {
            const token = await auth.currentUser.getIdToken();
            const response = await axios.post('/room/generate', payload,
                { headers: { Authorization: `Bearer ${token}` } });

            //no need to implement callback
            this.setState(()=>({
                linkId: response.data.roomID
            }));
        }
        catch(error)
        {
            console.log(error);
            this.setState({ generateResult: { ok: false } });
            return;
        }
        this.setState({ generateResult: { ok: true, link: this.state.linkId } });
    }

    /*trivial function to go to the room*/
    createGame()
    {
        //room has already been created
        //now just connect to the room with the room ID
        //if, connection successful, redirect to the main game page
        this.setState(()=>({
            setRedirect: true
        }));
        console.log("Setredirect setter");
    }

    /*trivial function to redirect to the link of the game*/
    joinGame(e)
    {
        //enter the url
        let joinLink= this.state.joinLink;
        let arrLink = joinLink.split("/");
        window.location.href="/room/"+arrLink[4];
        //go to the url
        //play game
    }

    render() {
        if(this.state.setRedirect)
        {
            window.location.href="/room/"+this.state.linkId;
        }
        else
        {
            return (
                <Dialog open={this.state.modalShow} onOpenChange={(o)=>{ if(!o) this.onCloseButtonClick(); }}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Multiplayer game</DialogTitle></DialogHeader>
                        <h5 className="font-medium">Join:</h5>
                        <Tabs defaultValue="new">
                            <TabsList>
                                <TabsTrigger value="new">Create New Room</TabsTrigger>
                                <TabsTrigger value="old">Join with link</TabsTrigger>
                            </TabsList>
                            <TabsContent value="new" className="space-y-3">
                                <h6 className="font-medium">Choose Your piece</h6>
                                <RadioGroup value={this.state.playerPiece || ''} onValueChange={(v)=>this.setPlayerPiece({ target: { value: v } })} className="flex gap-4">
                                    <div className="flex items-center gap-2"><RadioGroupItem value="goat" id="GoatChoice" /><Label htmlFor="GoatChoice">Goat</Label></div>
                                    <div className="flex items-center gap-2"><RadioGroupItem value="tiger" id="TigerChoice" /><Label htmlFor="TigerChoice">Tiger</Label></div>
                                </RadioGroup>
                                <p>Share the link below with your friends</p>
                                {this.state.generateResult && (this.state.generateResult.ok
                                    ? <p className="text-green-600">http://gameoftiger.prabal.dev/room/{this.state.generateResult.link}</p>
                                    : <p className="text-yellow-500">Error in generating key. Please press again.</p>)}
                                <Button onClick={this.onGenerateButtonClick}>Generate game link</Button>
                                <Button onClick={this.createGame}>Submit</Button>
                            </TabsContent>
                            <TabsContent value="old" className="space-y-3">
                                <Label htmlFor="JoinGame">Paste the URL Below to join the Room:</Label>
                                <Input type="url" id="JoinGame" value={this.state.joinLink} onChange={(e)=>this.setState({ joinLink: e.target.value })} />
                                <Button onClick={this.joinGame}>Join Game</Button>
                            </TabsContent>
                        </Tabs>
                        <DialogFooter><Button variant="secondary" onClick={this.onCloseButtonClick}>Close</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            )
        }
    }
}
