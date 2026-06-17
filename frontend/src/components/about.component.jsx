import React from 'react'
import heritagePhoto from '../SVG/landing.jpg'

//about page function displays simple facts about the developer
export default function AboutPage() {
    return (
        <main className="mx-auto max-w-2xl px-5 py-12">
            {/* featured heritage photo: elders playing Bagchal */}
            <figure className="heritage-card grain animate-rise overflow-hidden p-2">
                <div className="relative overflow-hidden rounded-lg">
                    <img
                        src={heritagePhoto}
                        alt="Two elders playing Bagchal in Nepal"
                        className="h-64 w-full object-cover object-center contrast-[1.02] sepia-[0.18] sm:h-80"
                    />
                    {/* warm parchment-toned gradient so the photo blends with the page */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/5 to-transparent" />
                    <figcaption className="absolute inset-x-0 bottom-0 p-4 text-left text-sm text-white drop-shadow">
                        Elders at a game of Bagchal — a pastime passed down for generations in Nepal.
                    </figcaption>
                </div>
            </figure>

            {/* about text */}
            <div className="animate-rise mt-6 text-center [animation-delay:90ms]">
                <p className="eyebrow mb-2">About</p>
                <h1 className="font-display text-3xl font-semibold tracking-tight">Game of the Tiger</h1>
                <p className="mt-4 text-muted-foreground">
                    An online take on <span className="font-medium text-foreground">Bagchal</span>, the traditional
                    Nepali board game of tigers and goats. Built and maintained by Prabal Chhatkuli.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                    See the <a href="/instruction" className="font-medium text-primary hover:underline">how-to-play</a> page for the rules.
                </p>
                <a
                    href="https://github.com/prabalchhatkuli/Gameofthetiger"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
                >
                    View source on GitHub →
                </a>
            </div>
        </main>
    )
}
