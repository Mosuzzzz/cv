import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mosu | Patiphan Chaiyakhun",
  description: "The portfolio of Patiphan Chaiyakhun, also known as Mosu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="light-theme">{children}</body>
    </html>
  );
}
