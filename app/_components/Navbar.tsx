"use client";

import React, { useState } from "react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Brand", href: "/brand" },
    { label: "Category", href: "/category" },
    { label: "Subcategory", href: "/subcategory" },
    { label: "Product", href: "/product" },
    { label: "Orders", href: "/orders" },
    { label: "Reels", href: "/reels" },
    { label: "Banners", href: "/banners" },
    { label: "Sale Products", href: "/sale-products" },
    { label: "Popular Products", href: "/popular-products" },
    { label: "Media", href: "/media" },
  ];

  const sidebar = (
    <aside className="bg-white h-screen mt-10 ml-5 flex flex-col w-64">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white py-2 mb-4 z-10">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 mb-10 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <nav className="space-y-2 pb-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              {item.label}
            </a>
          ))}

          <a
            href="/api/auth/logout"
            className="block px-3 py-2 rounded hover:bg-gray-200 text-red-600 transition-colors"
          >
            Logout
          </a>
        </nav>
      </div>
    </aside>
  );

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0">
        {sidebar}
      </div>

      {/* Mobile Hamburger */}
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

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative bg-white w-64 h-screen">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 text-gray-700 z-20"
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