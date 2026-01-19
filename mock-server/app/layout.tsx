import { Providers } from './providers';

export const metadata = {
  title: 'Pokemon GraphQL',
  description: 'A mock GraphQL server for testing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
