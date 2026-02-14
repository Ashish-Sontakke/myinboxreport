export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <p className="mt-1 text-muted-foreground">
        Your inbox analytics at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Emails", "Subscriptions", "Monthly Spend", "Monthly Income"].map(
          (label) => (
            <div
              key={label}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>
          )
        )}
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 text-center text-muted-foreground">
        <p>Sync your Gmail to start seeing insights here.</p>
      </div>
    </div>
  );
}
