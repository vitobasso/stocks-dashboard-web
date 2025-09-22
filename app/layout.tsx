import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import 'react-data-grid/lib/styles.css';
import "./globals.css";
import fs from 'fs';

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
                {children}
            </body>
        </html>
    );
}
