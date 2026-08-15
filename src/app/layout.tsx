"use client"

import { Source_Serif_4, Special_Elite, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { ClerkProvider, SignedIn } from '@clerk/nextjs';
import Navbar from "@/components/navbar/navigation-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from '@/components/ui/toaster';

// Field-notebook register: a printed-document serif for structure, a
// typewriter face for the handwritten-entry voice, mono for stamped metadata.
const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const entryVoice = Special_Elite({
  subsets: ['latin'],
  variable: '--font-entry',
  weight: '400',
});

const monoLabel = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-label',
  weight: ['400', '500'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <head>
          <title>Journee</title>
        </head>
        <body
          className={`${serif.variable} ${entryVoice.variable} ${monoLabel.variable} font-serif-display antialiased`}
        >
        {/*
          THESIS: a naturalist's day-almanac, not a travel-app dashboard; days are
          ruled ledger entries with an ink glyph for their state, photos are mounted
          specimens, entries are marginalia.
          OWN-WORLD: aged-paper cream ground, foxed warm-gray shadow, botanical-ink
          green + sepia/umber accents, one wax-seal red-orange reserved for the
          primary action. Printed-document serif for structure, typewriter face
          for entry text, tracked mono for stamped metadata.
          STORY: a solo traveler flips through ruled days, sees at a glance which
          are filled in ink versus blank, opens one, and it reads like a kept
          field record rather than a form.
          FIRST VIEWPOINT: day grid as ruled almanac rows with marginal ink glyphs,
          not square number tiles; trip cover framed as an almanac's opening page.
          FORM: field-almanac direction, round-2 index 7, seed key 3797b021.
          FINISH: unreviewed and undocumented is unfinished; this build ends with
          the finish review, the verdict, and DESIGN.md.
        */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <SignedIn>
            <Navbar/>
          </SignedIn>
            {children}
            <Toaster/>
        </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
