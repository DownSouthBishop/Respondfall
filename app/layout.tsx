import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Respondfall — Missed Call Revenue Recovery',
  description: 'Capture missed calls and convert them into revenue through automated SMS sequences.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
