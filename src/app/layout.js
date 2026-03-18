import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'GitHub Repository Analyzer',
  description: 'Analyze GitHub repositories for activity, complexity, and learning difficulty.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
