import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"   // ✅ always light
      forcedTheme="light"    // 🔒 force light mode
      enableSystem={false}   // 🚫 ignore OS dark mode
      disableTransitionOnChange
    >
      <main className="min-h-screen bg-white text-black">
        {children}
      </main>

      <Toaster position="top-center" reverseOrder={false} />
    </ThemeProvider>
  );
}
