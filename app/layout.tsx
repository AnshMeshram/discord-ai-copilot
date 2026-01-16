import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Discord AI Copilot - Admin Console",
  description: "Admin-controlled AI Discord Copilot",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
