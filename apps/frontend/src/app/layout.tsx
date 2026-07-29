import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DotShort",
  icons: {
    icon: "/link-alt.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <Providers>
          <div
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/bg.jpg')" }}
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
