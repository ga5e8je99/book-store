import './globals.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const metadata = {
  title: 'BookStore Control Hub — Management Dashboard',
  description: 'Full-featured standalone dashboard to manage books, sales, orders, and customer accounts.',
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
        <div className="dashboard-layout">
          <Sidebar />
          <div className="dashboard-main">
            <Topbar />
            <main className="dashboard-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

