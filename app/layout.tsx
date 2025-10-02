import { TreeProvider } from './context/TreeContext';
import './globals.css';

export const metadata = {
  title: 'Node Tree Manager',
  description: 'Interactive tree app',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <TreeProvider>{children}</TreeProvider>
      </body>
    </html>
  );
}