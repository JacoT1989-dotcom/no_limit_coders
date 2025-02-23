// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main>{children}</main>
        </ThemeProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
          duration={4000}
        />
      </body>
    </html>
  );
}
