import { AuthProvider } from "@/contexts/auth-context"

// Auth (and Google's GIS script) is scoped to /app — the marketing page
// stays free of third-party scripts.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
