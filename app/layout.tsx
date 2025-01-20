import type { Metadata } from "next";
import {Noto_Sans_JP} from 'next/font/google';
import clsx from 'clsx';
import "./globals.css";
import packageJson from '../package.json';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  title: packageJson.name,
  description: packageJson.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      data-theme="corporate"
      className={clsx(notoSansJP.variable, 'font-sans')}
    >
      <body>{children}</body>
    </html>
  );
}
