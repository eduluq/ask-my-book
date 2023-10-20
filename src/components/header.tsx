"use client";

import Link from "next/link";

function Header() {
  return (
    <nav className="fixed w-full px-24 py-4 bg-secondary">
      <Link href="/">
        <div className="text-xl font-semibold tracking-tight">Ask my book</div>
      </Link>
    </nav>
  );
}

export default Header;
