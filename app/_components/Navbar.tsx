"use client";

import React, { useState } from "react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Brand', href: '/brand' },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory', href: '/subcategory' },
    { label: 'Product', href: '/product' },
    { label: 'Orders', href: '/orders' },
    { label: 'Media', href: '/media' },
    // { label: 'Sale Products', href: '/sale-products' },
    // { label: 'Popular Products', href: '/popular-products' },
    // { label: 'Reels/Banner', href: '/reels-banner' },
  ];

  const sidebar = (
    <aside className="bg-white h-full mt-10 ml-5 flex flex-col">
      <div className="sticky top-0 bg-white py-2 mb-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded hover:bg-gray-200"
          >
            {item.label}
          </a>
        ))}
        <a href="/api/auth/logout" className="block px-3 py-2 rounded hover:bg-gray-200 text-red-600">Logout</a>
      </nav>
    </aside>
  );

  return (
    <div className="flex">
      {/* desktop sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0">
        {sidebar}
      </div>

      {/* mobile hamburger */}
      <div className="md:hidden p-2 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-700 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* overlay mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-white w-64 h-full">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 text-gray-700"
            >
              &#x2715;
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
