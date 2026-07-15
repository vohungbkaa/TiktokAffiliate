"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/crawler",
    label: "Crawl URLs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/products/new",
    label: "Add Product",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/import",
    label: "CSV Import",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12.53.02C13.84 0 15 1.04 15.02 2.35c.02.6-.19 1.18-.58 1.63a7.84 7.84 0 0 0-.29 3.01c.21 1.33 1.12 2.45 2.41 2.95.53.2 1.03.54 1.45.98.53.56.84 1.3.84 2.11 0 .97-.43 1.83-1.12 2.41a7.88 7.88 0 0 0-3.08 4.29c-.31 1.31-1.39 2.27-2.73 2.27a2.85 2.85 0 0 1-2.85-2.85c0-.6.18-1.16.51-1.63a7.83 7.83 0 0 0 .5-3.53 4.14 4.14 0 0 0-2.88-3.72A1.9 1.9 0 0 1 6 8.57c0-.7.38-1.31.96-1.63a7.87 7.87 0 0 0 3.8-5.32A2.84 2.84 0 0 1 12.53.02zM9 13v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1H9z" />
          </svg>
        </span>
        <div className="brand-text">
          <span className="brand-title">TikTok Ops</span>
          <span className="brand-subtitle">Affiliate Portal</span>
        </div>
      </Link>
      <nav className="nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-indicator online"></span>
          <span>Database Live</span>
        </div>
      </div>
    </aside>
  );
}
