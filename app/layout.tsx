import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "PrivateHire Cars | Book a minicab in London",
  description: "Book a safe, reliable minicab in London. 15% off online bookings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


