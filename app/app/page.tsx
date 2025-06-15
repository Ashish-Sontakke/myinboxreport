import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">My Inbox Report</h1>
      <p className="text-lg text-gray-500">
        Transform your Gmail into actionable insights.
      </p>
      <Button>Get Started</Button>
    </main>
  );
}
