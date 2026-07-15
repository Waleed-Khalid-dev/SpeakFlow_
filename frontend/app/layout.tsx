import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import NotificationToaster from "@/components/layout/NotificationToaster";
import ClientProviders from "@/components/layout/ClientProviders";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SpeakFlow AI",
  description: "Every reader. Every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
        <ClientProviders>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Sidebar />
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
          <NotificationToaster />
        </ClientProviders>
      </body>
    </html>
  );
}
