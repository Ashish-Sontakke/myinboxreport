"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import logo from "@/public/logo.svg";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
export function Header() {
  const { isAuthenticated, signIn } = useAuth();
  const router = useRouter();

  const handleGoToApp = async () => {
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }
    try {
      await signIn();
      router.push("/dashboard");
    } catch {
      // User cancelled sign-in
    }
  };

  return (
    <header className="sticky top-0 bg-background z-50 w-full ">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Image src={logo} alt="Logo" />
            </div>
            <span>{siteConfig.name}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href={siteConfig.links.github} passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      target="_blank"
                    >
                      GitHub
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button className="hidden sm:flex" onClick={handleGoToApp}>
            {isAuthenticated ? "Dashboard" : "Go to App"}
          </Button>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
