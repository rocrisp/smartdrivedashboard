import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SkipToContent } from "@/components/SkipToContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SmartDrive Dashboard",
    template: "%s | SmartDrive Dashboard",
  },
  description:
    "A floating window interface for managing your Google Drive files with intelligent organization, virtual buckets, and smart search.",
  keywords: [
    "Google Drive",
    "Drive Manager",
    "File Organization",
    "OAuth",
    "Next.js",
    "TypeScript",
    "Smart Dashboard",
  ],
  authors: [{ name: "SmartDrive Dashboard" }],
  creator: "SmartDrive Dashboard",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    title: "SmartDrive Dashboard",
    description: "A floating window interface for managing your Google Drive files",
    siteName: "SmartDrive Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartDrive Dashboard",
    description: "A floating window interface for managing your Google Drive files",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const effectiveTheme = theme === 'system' ? systemTheme : theme;
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SkipToContent />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
