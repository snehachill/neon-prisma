import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MessMate - Reduce Food Wastage",
  description: "MessMate helps reduce food wastage in mess halls by allowing students to indicate their meal attendance, enabling mess managers to prepare food more efficiently.",
  keywords: "mess management, food wastage reduction, student meal planning, canteen management",
  authors: [{ name: "MessMate Team" }],
  openGraph: {
    title: "MessMate",
    description: "Reduce food wastage with intelligent meal planning",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 to-slate-100`}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
