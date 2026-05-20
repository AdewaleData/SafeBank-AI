import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SafeBank AI — Smart, Secure Banking",
  description: "AI-powered banking with fraud detection, analytics, and emergency protection.",
  icons: {
    icon: "/safebank-ai-icon.png",
    apple: "/safebank-ai-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
