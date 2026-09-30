import "../src/styles.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "AEGIS / Rescue Command",
  description: "Autonomous disaster-response drone mission control dashboard.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e9edf0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
