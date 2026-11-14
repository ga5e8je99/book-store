import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuickViewModal from '../components/QuickViewModal';
import Toast from '../components/Toast';

export const metadata = {
  title: 'BookStore — Premier Modern Reading Platform',
  description: 'Curated literature, bestselling thrillers, science discovery and modern fiction with instant delivery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main style={{ flex: 1, width: '100%' }}>
              {children}
            </main>
            <Footer />
            <QuickViewModal />
            <Toast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

