import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh py-12 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Coming Soon!
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The app is still under development. We'll notify you once it's ready.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
