import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Website Builder - Create Professional Websites in Minutes",
  description: "Build stunning, production-ready Next.js websites with AI. Just provide your business details and download a complete, customized website instantly.",
  keywords: ["AI website builder", "Next.js", "TypeScript", "Tailwind CSS", "website generator", "AI web design"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
