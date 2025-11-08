import { Request, Resource } from '@/types/request';
import { MapPin, Home, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapViewProps {
  requests: Request[];
  resources: Resource[];
  selectedRequestId?: string;
  onPinClick: (requestId: string) => void;
}

export const MapView = ({ requests, resources, selectedRequestId, onPinClick }: MapViewProps) => {
  // Simple 2D representation of SF coordinates
  const normalizeCoords = (lat: number, lng: number) => {
    const minLat = 37.76;
    const maxLat = 37.79;
    const minLng = -122.49;
    const maxLng = -122.41;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x, y };
  };

  return (
    <div className="relative w-full h-full bg-muted/30 rounded-lg overflow-hidden border border-border">
      {/* Map background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map label */}
      <div className="absolute top-4 left-4 bg-card px-3 py-1 rounded-md shadow-sm border border-border z-10">
        <p className="text-xs font-medium text-muted-foreground">San Francisco Area</p>
      </div>

      {/* Resource pins */}
      {resources.map((resource) => {
        const { x, y } = normalizeCoords(resource.location.lat, resource.location.lng);
        return (
          <div
            key={resource.id}
            className="absolute transform -translate-x-1/2 -translate-y-full z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="relative group">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shadow-md',
                resource.type === 'food' ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'
              )}>
                {resource.type === 'food' ? (
                  <Utensils className="w-4 h-4" />
                ) : (
                  <Home className="w-4 h-4" />
                )}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <p className="text-xs font-medium">{resource.name}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Request pins */}
      {requests.map((request) => {
        const { x, y } = normalizeCoords(request.location.lat, request.location.lng);
        return (
          <div
            key={request.id}
            className="absolute transform -translate-x-1/2 -translate-y-full z-20 cursor-pointer"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onPinClick(request.id)}
          >
            <div className="relative group">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all',
                selectedRequestId === request.id 
                  ? 'bg-card border-primary scale-110' 
                  : 'bg-card border-border hover:scale-105'
              )}>
                <MapPin className={cn(
                  'w-5 h-5',
                  request.tone === 'Distressed' ? 'text-destructive' :
                  request.tone === 'Anxious' ? 'text-warning' : 'text-primary'
                )} />
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <p className="text-xs font-medium">{request.description}</p>
                <p className="text-xs text-muted-foreground">{request.name || 'Anonymous'}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
