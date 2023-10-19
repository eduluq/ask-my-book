import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "@/components/header";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Ask a book",
  description:
    "This is an experiment in using AI to make my book's content more accessible. Ask a question and AI'll answer it in real-time:",
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <Header />

        <div className="p-6 pt-24 lg:p-24 ">{children}</div>
      </body>
    </html>
  );
}
