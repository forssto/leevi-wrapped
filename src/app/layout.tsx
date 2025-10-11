import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Leevi Wrapped",
  description: "Henkilökohtainen Leevi-matkasi. Muistan jokaisen illan, jokaisen aamun, jokaisen päivän, ja jokaisen yön.",
  metadataBase: new URL('https://wrapped.leevi-projekti.com'),
  openGraph: {
    title: "Leevi Wrapped",
    description: "Henkilökohtainen Leevi-matkasi. Muistan jokaisen illan, jokaisen aamun, jokaisen päivän, ja jokaisen yön.",
    url: "https://wrapped.leevi-projekti.com",
    siteName: "Leevi Wrapped",
    images: [
      {
        url: "/kuvia/poliisi.png",
        width: 1200,
        height: 630,
        alt: "Leevi Wrapped",
      },
    ],
    locale: "fi_FI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leevi Wrapped",
    description: "Henkilökohtainen Leevi-matkasi. Muistan jokaisen illan, jokaisen aamun, jokaisen päivän, ja jokaisen yön.",
    images: ["/kuvia/poliisi.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
