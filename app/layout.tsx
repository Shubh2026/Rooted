import type { Metadata } from 'next';
import { Outfit, Fraunces } from 'next/font/google';
import Navigation from '../components/Navigation';
import FloatingActionButton from '../components/FloatingActionButton';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rooted - Carbon Footprint Awareness Platform',
  description: 'Nurture your digital garden, plant your personal tree, and reduce your carbon footprint with Rooted.',
  keywords: ['carbon footprint', 'sustainability', 'eco', 'tree', 'environment'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-500">
        <div className="flex-1 flex flex-col w-full px-4 md:px-0 py-6 md:py-8">
          <ErrorBoundary>
            <Navigation />
            <main className="flex-1 w-full max-w-6xl mx-auto mt-4 md:mt-8 pb-20 md:pb-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <FloatingActionButton />
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
