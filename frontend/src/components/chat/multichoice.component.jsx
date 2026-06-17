import React, { Component, useContext } from 'react'
import { UserContext } from "../../providers/UserProvider";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
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
        this.state={modalShow:true, playerPiece:null, linkId:null, setRedirect:false, userInfo: this.props.userInfo, generateResult: null, joinLink: '', copied: false};
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

    /* the full shareable URL for the generated room */
    roomLink = () => `https://gameoftiger.prabal.dev/room/${this.state.generateResult.link}`;

    /* copy the room link to the clipboard, with brief "Copied!" feedback */
    handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(this.roomLink());
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        } catch (err) {
            console.error('copy failed:', err);
        }
    }

    /* open the native share sheet (email/SMS/apps) on supported devices,
       falling back to copy on browsers without the Web Share API */
    handleShare = async () => {
        const url = this.roomLink();
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Game of the Tiger', text: 'Join my Bagchal game!', url });
            } catch (err) {
                /* user dismissed the share sheet — ignore */
            }
        } else {
            this.handleCopy();
        }
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
                    <DialogContent className="max-w-lg bg-card text-foreground">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="font-display text-2xl text-foreground">Play online</DialogTitle>
                            <p className="text-sm text-muted-foreground">Create a room or join a friend's link.</p>
                        </DialogHeader>

                        <Tabs defaultValue="new" className="mt-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="new">Create New Room</TabsTrigger>
                                <TabsTrigger value="old">Join with link</TabsTrigger>
                            </TabsList>

                            <TabsContent value="new" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Choose your side</p>
                                    <RadioGroup
                                        value={this.state.playerPiece || ''}
                                        onValueChange={(v)=>this.setPlayerPiece({ target: { value: v } })}
                                        className="flex gap-3"
                                    >
                                        <label
                                            htmlFor="GoatChoice"
                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors
                                                ${this.state.playerPiece === 'goat'
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-foreground hover:bg-muted/50'}`}
                                        >
                                            <RadioGroupItem value="goat" id="GoatChoice" />
                                            <Label htmlFor="GoatChoice" className="cursor-pointer text-accent font-medium">Goat</Label>
                                        </label>
                                        <label
                                            htmlFor="TigerChoice"
                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors
                                                ${this.state.playerPiece === 'tiger'
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-foreground hover:bg-muted/50'}`}
                                        >
                                            <RadioGroupItem value="tiger" id="TigerChoice" />
                                            <Label htmlFor="TigerChoice" className="cursor-pointer text-primary font-medium">Tiger</Label>
                                        </label>
                                    </RadioGroup>
                                </div>

                                {this.state.generateResult && (this.state.generateResult.ok ? (
                                    <div className="rounded-xl border border-border bg-background/60 p-4">
                                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                            <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
                                                <QRCodeSVG value={this.roomLink()} size={108} bgColor="#ffffff" fgColor="#184b89" level="M" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <p className="text-sm font-medium text-foreground">Scan, copy, or share to invite a friend</p>
                                                <p className="break-all rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">{this.roomLink()}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={this.handleCopy}>
                                                        {this.state.copied ? 'Copied!' : 'Copy link'}
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={this.handleShare}>Share</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-destructive">Error generating link. Please try again.</p>
                                ))}

                                <div className="flex gap-2">
                                    <Button size="sm" onClick={this.onGenerateButtonClick}>
                                        {this.state.generateResult && this.state.generateResult.ok ? 'Regenerate link' : 'Generate game link'}
                                    </Button>
                                    <Button size="sm" onClick={this.createGame}>Submit</Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="old" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="JoinGame" className="text-sm font-medium text-foreground">Paste the URL below to join the room:</Label>
                                    <Input
                                        type="url"
                                        id="JoinGame"
                                        value={this.state.joinLink}
                                        onChange={(e)=>this.setState({ joinLink: e.target.value })}
                                        placeholder="https://gameoftiger.prabal.dev/room/..."
                                        className="bg-background border-border"
                                    />
                                </div>
                                <Button size="sm" onClick={this.joinGame}>Join Game</Button>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-2">
                            <Button variant="outline" onClick={this.onCloseButtonClick}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
        }
    }
}
