import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface LocationDetails {
  timestamp: string;
  address: string;
  coordinates: string;
  position: { x: number; y: number };
}

export function MapView({ gpsPoints }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);
  const { toast } = useToast();

  // Load token on component mount
  useEffect(() => {
    const loadMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error loading Mapbox token:', error);
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
          setIsTokenSet(true);
        }
      } catch (error) {
        console.error('Error loading Mapbox token:', error);
        // Fallback to localStorage for backward compatibility
        const savedToken = localStorage.getItem('mapbox_token');
        if (savedToken) {
          setMapboxToken(savedToken);
          setIsTokenSet(true);
        }
      }
    };

    loadMapboxToken();
  }, []);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setIsTokenSet(true);
      // Save to localStorage as backup
      localStorage.setItem('mapbox_token', tokenInput.trim());
      toast({
        title: "Success",
        description: "Mapbox token saved successfully"
      });
    }
  };

  const handleMarkerClick = async (point: GpsPoint, markerElement: HTMLElement) => {
    setLoadingAddress(true);
    
    // Get marker position on screen
    const rect = markerElement.getBoundingClientRect();
    const mapRect = mapContainer.current?.getBoundingClientRect();
    
    if (!mapRect) return;
    
    const position = {
      x: rect.left - mapRect.left + rect.width / 2,
      y: rect.top - mapRect.top
    };
    
    // Set initial data while loading address
    setSelectedLocation({
      timestamp: new Date(point.timestamp).toLocaleString(),
      address: 'Loading address...',
      coordinates: `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`,
      position
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: {
          longitude: point.longitude,
          latitude: point.latitude
        }
      });

      if (error) {
        throw error;
      }

      setSelectedLocation(prev => prev ? {
        ...prev,
        address: data?.address || 'Address not found'
      } : null);
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedLocation(prev => prev ? {
        ...prev,
        address: 'Unable to load address'
      } : null);
      toast({
        title: "Error",
        description: "Failed to load address information",
        variant: "destructive"
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  const closePopover = () => {
    setSelectedLocation(null);
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !isTokenSet) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    // Determine initial center and zoom based on GPS points
    let center: [number, number] = [-71.0589, 42.3601]; // Default to Boston
    let zoom = 12;

    if (gpsPoints.length > 0) {
      // Sort GPS points by timestamp for proper numbering
      const sortedPoints = [...gpsPoints].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Use first point as center if only one point
      if (sortedPoints.length === 1) {
        center = [sortedPoints[0].longitude, sortedPoints[0].latitude];
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

    // Add click handler to close popover when clicking on map
    map.current.on('click', (e) => {
      // Only close popover if clicking on the map itself, not on markers
      const target = e.originalEvent.target as HTMLElement;
      if (selectedLocation && !target?.closest('.mapboxgl-marker') && !target?.closest('.gps-popover')) {
        closePopover();
      }
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Sort GPS points by timestamp for proper numbering
      const sortedPoints = [...gpsPoints].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Add GPS points as markers
      sortedPoints.forEach((point, index) => {
        if (!map.current) return;

        // Create custom marker element with number
        const markerElement = document.createElement('div');
        markerElement.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors';
        markerElement.innerHTML = `${index + 1}`;

        // Handle marker click - close any existing popover and open new one
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent map click event
          handleMarkerClick(point, markerElement);
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
    <div className="relative">
      <div className="space-y-4">
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border relative"
        />
        <div className="text-sm text-muted-foreground">
          Total GPS points: {gpsPoints.length}
          {gpsPoints.length > 0 && (
            <span className="ml-2">
              • Click numbered markers for location details
            </span>
          )}
        </div>
      </div>

      {/* GPS Location Popover */}
      {selectedLocation && (
        <Card 
          className="gps-popover absolute z-50 w-72 shadow-lg border"
          style={{
            left: `${selectedLocation.position.x - 144}px`, // Center the 288px (w-72) card
            top: `${selectedLocation.position.y - 10}px`, // Position above the marker
            transform: 'translateY(-100%)'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-sm">GPS Location Details</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={closePopover}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Date & Time</p>
                <p className="text-sm">{selectedLocation.timestamp}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Street Address</p>
                <p className="text-sm">
                  {loadingAddress ? 'Loading address...' : selectedLocation.address}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Coordinates</p>
                <p className="text-xs font-mono">{selectedLocation.coordinates}</p>
              </div>
            </div>
            {/* Arrow pointing to marker */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}