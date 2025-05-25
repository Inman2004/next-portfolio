import { Geist, Geist_Mono, Livvic } from "next/font/google";
import "./globals.css";
import Providers from "../providers";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const livvic = Livvic({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-livvic',
});

export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${livvic.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="mPfU4gmz2hZbYQTnwbs8gbWsMCbLtWzzZ6l1uSqatAQ" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${livvic.variable} font-sans bg-gray-950 text-white min-h-screen`}>
        <ErrorBoundary>
          <Providers>
            <Header />
            {children}
            <Toaster position="bottom-center" />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
