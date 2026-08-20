import './globals.css';

export const metadata = {
  title: 'Sistem Pendataan Warga',
  description: 'Aplikasi Input Data Warga RT/RW Berbasis Next.js & Firebase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
