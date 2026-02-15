import Link from "next/link";
import { siteConfig } from "@/config";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Terms
          </Link>
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a href={siteConfig.links.author} className="hover:text-primary">
              Ashish
            </a>{" "}
            & Claude Code
          </p>
        </div>
      </div>
    </footer>
  );
}
