import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-svh">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We could not find the page you were looking for.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Go back to {siteConfig.name}</Link>
        </Button>
      </div>
    </div>
  );
}
