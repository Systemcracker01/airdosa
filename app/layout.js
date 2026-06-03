import './globals.css';

export const metadata = {
  title: 'AirDosa — AI-Powered Instant Drone Dosa Delivery',
  description:
    'Get hot, crispy dosas delivered to your balcony in minutes. AI-optimized baking thermal pods, hypersonic drones, and precision drops. Ghee at Mach 0.8.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
