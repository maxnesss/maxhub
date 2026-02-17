import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://maxhub.vercel.app"),
  title: {
    default: "MaxHub - Personal Workspace for Projects and Future Apps",
    template: "%s | MaxHub",
  },
  description:
    "MaxHub is your personal workspace for managing projects, ideas, and future apps in one focused environment.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MaxHub - Personal Workspace for Projects and Future Apps",
    description:
      "Plan projects, organize ideas, and grow your internal app hub from one clean workspace.",
    url: "https://maxhub.vercel.app",
    siteName: "MaxHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxHub - Personal Workspace for Projects and Future Apps",
    description:
      "Plan projects, organize ideas, and grow your internal app hub from one clean workspace.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
