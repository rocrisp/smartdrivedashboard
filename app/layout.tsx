import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SkipToContent } from "@/components/SkipToContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "My Google Dashboard",
    template: "%s | My Google Dashboard",
  },
  description:
    "A modern, secure personal dashboard for managing your Google services. Built with Next.js, TypeScript, and PostgreSQL.",
  keywords: [
    "Google Dashboard",
    "OAuth",
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Personal Dashboard",
  ],
  authors: [{ name: "My Google Dashboard" }],
  creator: "My Google Dashboard",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    title: "My Google Dashboard",
    description: "A modern personal dashboard for your Google services",
    siteName: "My Google Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Google Dashboard",
    description: "A modern personal dashboard for your Google services",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipToContent />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
