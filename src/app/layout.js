import './globals.css';

export const metadata = {
  title: 'In a Nutshell',
  description: 'The short, useful version of anything.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
