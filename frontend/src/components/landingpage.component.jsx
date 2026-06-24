import React from 'react'
import { Button } from '@/components/ui/button';
import tigerSvg from '../SVG/tiger.svg'
import goatSvg from '../SVG/goat.svg'

/**/
/*
function landingpage(props)
        The landing / hero page. props.userInfo carries the signed-in user.
*/
/**/
export default function landingpage(props) {
    const signedIn = props.userInfo !== null;

    return (
        <main className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            {/* left: copy */}
            <section className="animate-rise">
                <p className="eyebrow mb-4 flex items-center gap-2">
                    <span className="h-px w-8 bg-primary" />
                    A traditional game of Nepal
                </p>

                <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                    Bagchal
                    <span className="mt-2 block text-2xl font-normal italic text-muted-foreground sm:text-3xl">
                        four tigers, twenty goats, one board
                    </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                    The tigers hunt; the goats encircle. Play the computer across three difficulties,
                    pass-and-play on one device, or challenge a friend online.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg" className="rounded-full px-7 text-base shadow-lg shadow-primary/20">
                        <a href="/game">Start playing</a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full px-7 text-base">
                        <a href="/instruction">Learn the rules</a>
                    </Button>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-sm">
                    <span className={`h-2 w-2 rounded-full ${signedIn ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                    {signedIn
                        ? <span>Welcome back, <span className="font-medium text-foreground">{props.userInfo.email}</span></span>
                        : <span className="text-muted-foreground">Playing as a guest — <a href="/login" className="font-medium text-primary hover:underline">log in</a> to track your record</span>}
                </div>
            </section>

            {/* right: emblem */}
            <section className="animate-rise [animation-delay:120ms]">
                <div className="heritage-card grain mx-auto aspect-square w-full max-w-sm overflow-hidden p-8">
                    <div className="relative grid h-full place-items-center rounded-lg bg-accent/[0.06]">
                        {/* board cross-lines motif */}
                        <div className="pointer-events-none absolute inset-6 rounded-md border border-accent/25" />
                        <div className="pointer-events-none absolute inset-10 border border-accent/15" style={{ transform: 'rotate(45deg)' }} />
                        <img src={tigerSvg} alt="tiger" className="absolute left-7 top-7 w-16 drop-shadow-md" />
                        <img src={goatSvg} alt="goat" className="absolute bottom-7 right-7 w-14 drop-shadow-md" />
                        <span className="font-display text-7xl font-semibold text-primary/90">वाघ</span>
                    </div>
                </div>
                <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">tiger vs. goats</p>
            </section>
        </main>
    );
}
