import { Archivo_Black, Roboto_Mono } from 'next/font/google';
import './globals.css';

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo', // Renamed to avoid collision
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto', // Renamed to avoid collision
  display: 'swap',
});

export const metadata = {
  title: 'In a Nutshell',
  description: 'The short, useful version of anything.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
