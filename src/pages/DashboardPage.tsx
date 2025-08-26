import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of crew hours, submissions, and performance metrics.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}