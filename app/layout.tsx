import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TikTok Affiliate Ops",
  description: "Product data and crawler operations dashboard",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/products/new", label: "Add Product" },
  { href: "/import", label: "CSV Import" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Link className="brand" href="/">
              <span className="brand-mark">TA</span>
              <span>TikTok Affiliate Ops</span>
            </Link>
            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
