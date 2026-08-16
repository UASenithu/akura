import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ ONE metadata export (not two!)
export const metadata = {
  metadataBase: new URL('https://akura-alpha.vercel.app'),
  title: "Akura - Learn Without Stress",
  description: "AI-powered learning platform for Sri Lankan A/L students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Akura",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "Akura - Learn Without Stress",
    description: "AI-powered learning platform for Sri Lankan A/L students",
    url: "https://akura.lk",
    siteName: "Akura",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akura - Learn Without Stress",
    description: "AI-powered learning platform for Sri Lankan A/L students",
    images: ["/icons/icon-512x512.png"],
  },
};

// ✅ Separate viewport export (moved from metadata)
export const viewport = {
  themeColor: "#6366f1",
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Akura" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}