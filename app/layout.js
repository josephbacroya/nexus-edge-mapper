import './globals.css';

export const metadata = {
  title: 'Nexus-Edge Mapper',
  description: 'Cyberpunk-inspired real-time geospatial telemetry dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-mono text-gray-200">
        {children}
      </body>
    </html>
  );
}
