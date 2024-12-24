'use client'
import "./globals.css";
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      ><div className="absolute inset-0 min-h-screen h-full w-full bg-white bg-[linear-gradient(to_right,#80808032_1px,transparent_1px),linear-gradient(to_bottom,#80808032_1px,transparent_1px)] bg-[size:24px_24px] z-[-100000]"></div>
        {children}
      </body>
    </html>
  );
}
