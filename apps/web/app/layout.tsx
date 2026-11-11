import type { Metadata } from "next";
import "./globals.css";
import "./future.css";
import "./sky-workspaces.css";
import { MotionProvider } from "../components/motion-system";
export const metadata: Metadata = {
  title: "VENTUREX — Where Vision Meets Capital",
  description:
    "Discover extraordinary startups and build meaningful connections. A fictional investment ecosystem demonstration.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
