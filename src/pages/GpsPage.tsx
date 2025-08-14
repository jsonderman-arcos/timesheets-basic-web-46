import { GpsTracking } from '@/components/gps/GpsTracking';

export default function GpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GPS Tracking</h1>
        <p className="text-muted-foreground">
          View GPS breadcrumb trails showing crew location data throughout their workday.
        </p>
      </div>
      <GpsTracking />
    </div>
  );
}