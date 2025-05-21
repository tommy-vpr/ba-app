// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { getInitialDashboardData } from "@/app/actions/getInitialDashboardData";
import { ContactProvider } from "@/context/ContactContext";
import { EditContactModal } from "@/components/EditContactModal";
import { LogMeetingModal } from "@/components/LogMeetingModal";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brand Ambassador Dashboard | BA App",
  description:
    "Effortlessly manage brand ambassadors with the BA App — featuring HubSpot integration, lead status filters, zip code search, and real-time updates.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-[#06070a]`}
      >
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
