import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface GpsPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

interface MapViewProps {
  gpsPoints: GpsPoint[];
}

export function MapView({ gpsPoints }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setIsTokenSet(true);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !isTokenSet) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    // Determine initial center and zoom based on GPS points
    let center: [number, number] = [-71.0589, 42.3601]; // Default to Boston
    let zoom = 12;

    if (gpsPoints.length > 0) {
      // Calculate bounds of all GPS points
      const bounds = new mapboxgl.LngLatBounds();
      gpsPoints.forEach(point => {
        bounds.extend([point.longitude, point.latitude]);
      });
      
      // Use first point as center if only one point
      if (gpsPoints.length === 1) {
        center = [gpsPoints[0].longitude, gpsPoints[0].latitude];
        zoom = 15;
      }
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;

      // Add GPS points as markers
      gpsPoints.forEach((point, index) => {
        if (!map.current) return;

        // Create marker popup content
        const popupContent = `
          <div class="p-2">
            <div class="font-semibold">Point ${index + 1}</div>
            <div class="text-sm text-gray-600">
              Time: ${new Date(point.timestamp).toLocaleTimeString()}
            </div>
            <div class="text-sm text-gray-600">
              Lat: ${point.latitude.toFixed(6)}
            </div>
            <div class="text-sm text-gray-600">
              Lng: ${point.longitude.toFixed(6)}
            </div>
            ${point.accuracy ? `<div class="text-xs text-gray-500">Accuracy: ±${point.accuracy.toFixed(1)}m</div>` : ''}
          </div>
        `;

        // Create custom marker element with number
        const markerElement = document.createElement('div');
        markerElement.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors';
        markerElement.innerHTML = `${index + 1}`;

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        // Handle popup opening - close any existing popup first
        markerElement.addEventListener('click', () => {
          if (currentPopup.current) {
            currentPopup.current.remove();
          }
          currentPopup.current = popup;
          popup.addTo(map.current!);
        });

        // Create marker with custom element
        const marker = new mapboxgl.Marker({
          element: markerElement
        })
          .setLngLat([point.longitude, point.latitude])
          .addTo(map.current);
      });

      // If we have multiple points, fit the map to show all of them
      if (gpsPoints.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        gpsPoints.forEach(point => {
          bounds.extend([point.longitude, point.latitude]);
        });
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 }
        });
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [gpsPoints, mapboxToken, isTokenSet]);

  if (!isTokenSet) {
    return (
      <div className="border rounded-lg p-6 bg-muted/10">
        <div className="text-center space-y-4">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="font-semibold">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your Mapbox public token to view the GPS tracking map.
          </p>
          <p className="text-xs text-muted-foreground">
            Get your token from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter Mapbox public token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <Button onClick={handleSetToken}>Set Token</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border"
      />
      <div className="text-sm text-muted-foreground">
        Total GPS points: {gpsPoints.length}
        {gpsPoints.length > 0 && (
          <span className="ml-2">
            • Click markers for details
          </span>
        )}
      </div>
    </div>
  );
}