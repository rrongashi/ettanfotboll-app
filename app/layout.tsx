import type { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'Next.js + Mongoose (TS) Starter',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


