import { ExportTimesheets } from '@/components/export/ExportTimesheets';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Timecards</h1>
        <p className="text-muted-foreground">
          Export timecard data in CSV or Excel format for reporting and analysis.
        </p>
      </div>
      <ExportTimesheets />
    </div>
  );
}