import { Outfit, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata = {
  title: "GroNow. Groceries in 15 Minutes.",
  description: "Bhubaneswar's hyper-local, algorithmic grocery delivery platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GroNow App",
  },
};

export const viewport = {
  themeColor: "#FFC800",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="font-body bg-gronow-asphalt text-gronow-cloud antialiased">
        {children}
      </body>
    </html>
  );
}
