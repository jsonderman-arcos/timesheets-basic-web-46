import { TimesheetGrid } from '@/components/timesheet/TimesheetGrid';

export default function TimesheetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timecard Overview</h1>
        <p className="text-muted-foreground">
          View daily timecard submissions by crew. Click on any cell to see detailed information.
        </p>
      </div>
      <TimesheetGrid />
    </div>
  );
}