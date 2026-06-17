import React from 'react'

//about page function displays simple facts about the developer
export default function AboutPage() {
    return (
        <main className="mx-auto max-w-2xl px-5 py-16">
            <div className="heritage-card animate-rise p-8 text-center sm:p-10">
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
