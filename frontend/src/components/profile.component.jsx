import React, { Component } from 'react'
import { getUserDocument} from '../firebase.config.js';
import { AVATARS } from '../avatars';
import { saveAvatar } from '../firebase.config.js';

/**/
/*
class Profile

NAME

        Profile component - renders the profile of the authenticated user

SYNOPSIS
        props       -> receives the user object as a props
        states:
          name, email, wins , losses ->states for user information

DESCRIPTION

        This class will render the Profile for the user. The user profile will contain
        information from the firestore. The information is retrieved using the uid of the 
        user object userInfo received as props.

RETURNS

        no returns. renders the profile with all information

AUTHOR

        Prabal Chhatkuli

DATE

        3/27/2020

*/
/**/
export default class Profile extends Component {
    //constructor for the component for initalizing states
    constructor(props)
    {
        super(props);
        this.state = {
            name:'',
            email:'',
            wins:0,
            losses:0,
            aiStats:null
        }
    }

    pickAvatar = (emoji) => {
        this.props.onAvatarChange && this.props.onAvatarChange(emoji);
        saveAvatar(emoji).catch(err => console.error('saveAvatar failed:', err));
    }

    /**/
    /*
    componentDidUpdate(prevprops)

    NAME

            componentDidUpdate - built in function of React which runs on update of the ReactDOM

    DESCRIPTION

            This class will retrieve user information using the function getUserDocument from
            the firestore, using the uid from userInfo. it will then set the states to the 
            information from firestore to update the DOM.

    RETURNS

            no returns. renders the profile with all information

    AUTHOR

            Prabal Chhatkuli

    DATE

            3/27/2020

    */
    /**/
    async componentDidUpdate(prevprops)
    {
        if(this.props.userInfo !==prevprops)
        {
            //retrieve the doc
            var document = await getUserDocument(this.props.userInfo.uid)
            
            //setStates
            this.setState((state, props)=>{
                return {name:document.firstname + " "+document.lastname,
                email: document.email,
                wins: document.wins,
                losses: document.losses,
                aiStats: document.aiStats || null}
            })
        }
    }

    //render method for the component
    render() {

        return (
            <main className="mx-auto max-w-3xl px-5 py-12">
                {/* Avatar header block */}
                <div className="heritage-card animate-rise mb-6 p-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card text-4xl shadow-sm">
                        {this.props.avatar}
                    </div>
                    <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">{this.state.name || 'Player'}</h1>
                    <p className="text-sm text-muted-foreground">{this.state.email}</p>
                    <p className="eyebrow mt-5 mb-2">Choose your avatar</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {AVATARS.map(e => (
                            <button key={e} onClick={() => this.pickAvatar(e)}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors ${this.props.avatar === e ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="heritage-card p-6 text-center">
                        <span className="font-display text-4xl font-semibold text-primary">
                            {this.state.wins}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">Wins</p>
                    </div>
                    <div className="heritage-card p-6 text-center">
                        <span className="font-display text-4xl font-semibold text-foreground">
                            {this.state.losses}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">Losses</p>
                    </div>
                </div>

                {/* Vs Computer section */}
                <div className="heritage-card p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Vs Computer</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="py-2 pr-4">Difficulty</th>
                                <th className="py-2 pr-4">As Tiger (W&ndash;L)</th>
                                <th className="py-2">As Goat (W&ndash;L)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['easy', 'medium', 'hard'].map(level => {
                                const s = (this.state.aiStats && this.state.aiStats[level]) || {};
                                const t = s.tiger || { wins: 0, losses: 0 };
                                const g = s.goat || { wins: 0, losses: 0 };
                                return (
                                    <tr key={level} className="border-b border-border/60 last:border-b-0">
                                        <td className="py-2 pr-4 capitalize">{level}</td>
                                        <td className="py-2 pr-4">{(t.wins || 0)}&ndash;{(t.losses || 0)}</td>
                                        <td className="py-2">{(g.wins || 0)}&ndash;{(g.losses || 0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        )
    }
}
