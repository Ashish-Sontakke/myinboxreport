import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "./ui/button";

export default function Header() {
  return (
    <header className=" backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image src="/logo.png" alt="My Inbox Report" width={32} height={32} />
          <span className="font-semibold text-lg">My Inbox Report</span>
        </Link>
      </div>
    </header>
  );
}
