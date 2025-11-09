import { Request, Resource } from '@/types/request';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Phone, MessageCircle } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyeXVrZyIsImEiOiJjbWhxbWFzYW4wcGdkMmxxMm1ycGxzODR3In0.KzoImBHy8KS-tRDddiak7A';

interface MapViewProps {
  requests: Request[];
  resources: Resource[];
  selectedRequestId?: string;
  onPinClick: (requestId: string) => void;
}

export const MapView3D = ({ requests, resources, selectedRequestId, onPinClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Safety checks
  const safeRequests = requests || [];
  const safeResources = resources || [];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map with 3D buildings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // SF center
      zoom: 13,
      pitch: 45, // 3D tilt
      bearing: -17.6,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add 3D buildings layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add resource markers
    safeResources.forEach((resource) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      el.style.border = '3px solid white';
      el.style.transition = 'transform 0.2s';
      
      // Color based on type
      const colors: Record<string, string> = {
        food: '#10b981',
        shelter: '#8b5cf6',
        legal: '#eab308',
        medical: '#ec4899'
      };
      el.style.backgroundColor = colors[resource.type] || '#6b7280';

      // Icon based on type
      const icons: Record<string, string> = {
        food: '🍎',
        shelter: '🏠',
        legal: '⚖️',
        medical: '🏥'
      };
      el.innerHTML = `<span style="font-size: 20px;">${icons[resource.type] || '📍'}</span>`;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popupContent = `
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${resource.name}</h3>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${resource.location.address}</p>
          ${resource.phone ? `<p style="font-size: 14px; color: #2563eb; margin-bottom: 4px;">📞 ${resource.phone}</p>` : ''}
          ${resource.hours ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">⏰ ${resource.hours}</p>` : ''}
          ${resource.services && resource.services.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              ${resource.services.map(service => `
                <span style="font-size: 12px; background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px;">${service}</span>
              `).join('')}
            </div>
          ` : ''}
          <button 
            onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${resource.location.lat},${resource.location.lng}', '_blank')"
            style="width: 100%; background-color: #3b82f6; color: white; font-size: 14px; padding: 8px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <span>🧭</span>
            Get Directions
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([resource.location.lng, resource.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add request markers
    safeRequests.forEach((request) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      el.style.border = '3px solid white';
      el.style.transition = 'transform 0.2s';
      el.style.animation = 'pulse 2s infinite';

      // Color based on tone
      const toneColors: Record<string, string> = {
        Distressed: '#ef4444',
        Anxious: '#f59e0b',
        Calm: '#3b82f6'
      };
      el.style.backgroundColor = toneColors[request.tone] || '#3b82f6';

      el.innerHTML = '<span style="font-size: 20px;">🆘</span>';

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Highlight if selected
      if (selectedRequestId === request.id) {
        el.style.border = '4px solid yellow';
        el.style.boxShadow = '0 0 20px rgba(250, 204, 21, 0.8)';
      }

      // Create popup
      const statusColors: Record<string, string> = {
        open: '#9ca3af',
        assigned: '#3b82f6',
        resolved: '#10b981'
      };

      const popupContent = `
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${request.name || 'Anonymous'}</h3>
          <p style="font-size: 14px; margin-bottom: 8px; color: #374151;">${request.description}</p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 12px; background-color: ${request.tone === 'Distressed' ? '#fee2e2' : request.tone === 'Anxious' ? '#fef3c7' : '#dbeafe'}; color: ${request.tone === 'Distressed' ? '#991b1b' : request.tone === 'Anxious' ? '#92400e' : '#1e40af'}; padding: 4px 8px; border-radius: 4px;">${request.tone}</span>
            <span style="font-size: 12px; background-color: ${request.status === 'resolved' ? '#d1fae5' : request.status === 'assigned' ? '#dbeafe' : '#f3f4f6'}; color: ${request.status === 'resolved' ? '#065f46' : request.status === 'assigned' ? '#1e40af' : '#374151'}; padding: 4px 8px; border-radius: 4px;">${request.status}</span>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${request.location.address}</p>
          <button 
            onclick="document.dispatchEvent(new CustomEvent('viewRequest', { detail: '${request.id}' }))"
            style="width: 100%; background-color: #3b82f6; color: white; font-size: 14px; padding: 8px; border-radius: 8px; border: none; cursor: pointer;"
          >
            View Details
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([request.location.lng, request.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPinClick(request.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (safeRequests.length > 0 || safeResources.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      [...safeRequests, ...safeResources].forEach(item => {
        bounds.extend([item.location.lng, item.location.lat]);
      });
      map.current?.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [safeRequests, safeResources, selectedRequestId, onPinClick, mapLoaded]);

  // Listen for custom event
  useEffect(() => {
    const handleViewRequest = (e: CustomEvent) => {
      onPinClick(e.detail);
    };
    document.addEventListener('viewRequest', handleViewRequest as EventListener);
    return () => {
      document.removeEventListener('viewRequest', handleViewRequest as EventListener);
    };
  }, [onPinClick]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-bold text-xs mb-2 text-gray-800">Map Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span>🆘</span>
            <span className="text-gray-700">Help Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🍎</span>
            <span className="text-gray-700">Food Banks</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏠</span>
            <span className="text-gray-700">Shelters</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚖️</span>
            <span className="text-gray-700">Legal Aid</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏥</span>
            <span className="text-gray-700">Medical</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading 3D Map...</p>
          </div>
        </div>
      )}

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );
};
