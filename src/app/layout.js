import { Unbounded, Space_Mono } from 'next/font/google';
import './globals.css';

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'In a Nutshell',
  description: 'The short, useful version of anything.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
