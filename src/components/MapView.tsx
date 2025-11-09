import { Request, Resource } from '@/types/request';
import { MapPin, Home, Utensils, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

interface MapViewProps {
  requests: Request[];
  resources: Resource[];
  selectedRequestId?: string;
  onPinClick: (requestId: string) => void;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, IconComponent: any) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 3px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${IconComponent}
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const requestIcon = (tone: string) => {
  const color = tone === 'Distressed' ? '#ef4444' : tone === 'Anxious' ? '#f59e0b' : '#3b82f6';
  return createCustomIcon(color, '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>');
};

const foodIcon = createCustomIcon('#10b981', '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>');
const shelterIcon = createCustomIcon('#8b5cf6', '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
const legalIcon = createCustomIcon('#f59e0b', '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>');
const medicalIcon = createCustomIcon('#ec4899', '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>');

// Component to handle map events and fitBounds
const MapController = ({ requests, resources }: { requests: Request[], resources: Resource[] }) => {
  const map = useMap();

  useEffect(() => {
    if (requests.length > 0 || resources.length > 0) {
      const allPoints = [
        ...requests.map(r => [r.location.lat, r.location.lng] as [number, number]),
        ...resources.map(r => [r.location.lat, r.location.lng] as [number, number])
      ];
      
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [requests, resources, map]);

  return null;
};

export const MapView = ({ requests, resources, selectedRequestId, onPinClick }: MapViewProps) => {
  const center: [number, number] = [37.7749, -122.4194]; // SF center
  const [mapReady, setMapReady] = useState(false);

  // Safety checks
  const safeRequests = requests || [];
  const safeResources = resources || [];

  // Delay map initialization to ensure container is ready
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render map until ready
  if (!mapReady) {
    return (
      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hyeXVrZyIsImEiOiJjbWhxbWFzYW4wcGdkMmxxMm1ycGxzODR3In0.KzoImBHy8KS-tRDddiak7A`}
          tileSize={512}
          zoomOffset={-1}
        />
        
        <MapController requests={safeRequests} resources={safeResources} />

        {/* Resource markers */}
        {safeResources.map((resource) => {
          const icon = resource.type === 'food' ? foodIcon : 
                      resource.type === 'shelter' ? shelterIcon :
                      resource.type === 'legal' ? legalIcon :
                      resource.type === 'medical' ? medicalIcon : foodIcon;
          
          return (
            <Marker
              key={resource.id}
              position={[resource.location.lat, resource.location.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-base mb-2">{resource.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{resource.location.address}</p>
                  <p className="text-sm font-medium text-blue-600 mb-1">📞 {resource.phone}</p>
                  <p className="text-sm text-gray-500 mb-2">⏰ {resource.hours}</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.services?.map((service, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {service}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.location.lat},${resource.location.lng}`, '_blank')}
                    className="mt-2 w-full bg-blue-500 text-white text-sm py-1 px-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Request markers */}
        {safeRequests.map((request) => (
          <Marker
            key={request.id}
            position={[request.location.lat, request.location.lng]}
            icon={requestIcon(request.tone)}
            eventHandlers={{
              click: () => onPinClick(request.id)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-base mb-2">{request.name || 'Anonymous'}</h3>
                <p className="text-sm mb-2">{request.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    request.tone === 'Distressed' ? 'bg-red-100 text-red-800' :
                    request.tone === 'Anxious' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  )}>
                    {request.tone}
                  </span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    request.status === 'open' ? 'bg-gray-100 text-gray-800' :
                    request.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  )}>
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{request.location.address}</p>
                <button
                  onClick={() => onPinClick(request.id)}
                  className="mt-2 w-full bg-blue-500 text-white text-sm py-1 px-2 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
