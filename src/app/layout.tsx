"use client"

import { Varela_Round } from 'next/font/google';
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignedIn } from '@clerk/nextjs';
import Navbar from "@/components/navbar/navigation-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from '@/components/ui/toaster';

const varelaRound = Varela_Round({
  subsets:['latin'],
  weight:"400"
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${varelaRound.className} antialiased`}
        >
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
