import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "INTELLIXLEARN – AI-Powered Learning Platform",
  description:
    "Gamified STEM learning for students with AI personalization, progress tracking, and interactive assessments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          expand
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
