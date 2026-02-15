import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { siteConfig } from "@/config";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 bg-background z-50 w-full">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Image src={logo} alt="Logo" />
          </div>
          <span className="font-display">{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-4" />
            <span className="hidden md:inline">GitHub</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
