import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import 'react-data-grid/lib/styles.css';
import "./globals.css";
import fs from 'fs';
import {LocalStorage} from "@/components/features/local-storage";
import React from "react";
import {Analytics} from "@vercel/analytics/next"
import {Theme} from "@/components/features/theme";
import {Providers} from "@/app/providers";

const iconSvg = encodeURIComponent(fs.readFileSync('./public/icon.svg', 'utf8'));

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Monitor de Ações",
    description: "",
    icons: { icon: [{ url: `data:image/svg+xml,${iconSvg}`, type: 'image/svg+xml' }] },
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <LocalStorage/>
                <Theme/>
                <Providers>{children}</Providers>
                <Analytics/>
            </body>
        </html>
    );
}
