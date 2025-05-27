import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {currentYear} My Inbox Report.</span>
            <span>All rights reserved.</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center text-sm">
            <Link
              href="/privacy"
              className={buttonVariants({
                variant: "ghost",
                className: "text-sm",
              })}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={buttonVariants({
                variant: "ghost",
                className: "text-sm",
              })}
            >
              Terms
            </Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/Ashish-Sontakke/myinboxreport"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Created by</span>
              <Link
                href="https://www.ashish.so"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors font-medium"
              >
                Ashish
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
