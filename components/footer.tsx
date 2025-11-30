import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Twitter } from "lucide-react";
import { siteConfig } from "@/config";
import logo from "@/public/logo.svg";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 flex items-center justify-around">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a href={siteConfig.links.author} className="hover:text-primary">
              Ashish
            </a>
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
