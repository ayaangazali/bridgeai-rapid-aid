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

// San Francisco neighborhood risk assessment based on historical data
const assessNeighborhoodRisk = (lat: number, lng: number, address: string): { risk: string; description: string; color: string } => {
  const addressLower = address.toLowerCase();
  
  // High-risk areas
  if (addressLower.includes('tenderloin') || addressLower.includes('6th st') || addressLower.includes('market st') && addressLower.includes('6th')) {
    return { risk: 'High Risk Area', description: 'Known for drug activity, homelessness crisis. Exercise extreme caution. Avoid after dark.', color: '#dc2626' };
  }
  if (addressLower.includes('mission') && (addressLower.includes('16th') || addressLower.includes('24th'))) {
    return { risk: 'Elevated Risk', description: 'Higher property crime. Stay alert, avoid isolated areas at night.', color: '#ea580c' };
  }
  if (addressLower.includes('bayview') || addressLower.includes('hunter') || addressLower.includes('sunnydale')) {
    return { risk: 'High Risk Area', description: 'Gang activity reported. Increased violent crime. Travel in groups.', color: '#dc2626' };
  }
  if (addressLower.includes('soma') || addressLower.includes('south of market')) {
    return { risk: 'Moderate Risk', description: 'Mixed area. Some blocks safer than others. Stay aware of surroundings.', color: '#f59e0b' };
  }
  
  // Moderate-risk areas
  if (addressLower.includes('civic center') || addressLower.includes('un plaza')) {
    return { risk: 'Moderate Risk', description: 'Heavy homeless presence. Petty theft common. Keep valuables secure.', color: '#f59e0b' };
  }
  if (addressLower.includes('western addition') || addressLower.includes('fillmore')) {
    return { risk: 'Moderate Risk', description: 'Gentrifying area. Some pockets safer than others.', color: '#f59e0b' };
  }
  
  // Lower-risk areas
  if (addressLower.includes('marina') || addressLower.includes('pacific heights') || addressLower.includes('presidio')) {
    return { risk: 'Low Risk Area', description: 'Affluent, well-patrolled neighborhood. Generally safe.', color: '#16a34a' };
  }
  if (addressLower.includes('sunset') || addressLower.includes('richmond')) {
    return { risk: 'Low Risk Area', description: 'Residential, family-friendly area. Low crime rates.', color: '#16a34a' };
  }
  if (addressLower.includes('noe valley') || addressLower.includes('castro')) {
    return { risk: 'Low Risk Area', description: 'Safe, walkable neighborhood. Active community watch.', color: '#16a34a' };
  }
  
  // Default based on lat/lng (rough SF zones)
  if (lat > 37.78 && lng > -122.42) {
    return { risk: 'Low-Moderate Risk', description: 'Northeastern SF. Generally safer, tourist-heavy areas.', color: '#84cc16' };
  }
  if (lat < 37.75) {
    return { risk: 'Moderate Risk', description: 'Southern SF. Mixed safety levels. Stay vigilant.', color: '#f59e0b' };
  }
  
  return { risk: 'Unknown Area', description: 'Safety information unavailable. Exercise standard precautions.', color: '#6b7280' };
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

    // Initialize map with enhanced performance and smooth animations
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // SF center
      zoom: 13,
      pitch: 45, // 3D tilt
      bearing: -17.6,
      antialias: true,
      // Performance optimizations for 60fps
      preserveDrawingBuffer: false,
      refreshExpiredTiles: false,
      maxTileCacheSize: 50,
      renderWorldCopies: false,
      // Smooth animations
      fadeDuration: 300,
      // Better interaction
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true,
      doubleClickZoom: true
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

      // Optimized 3D buildings - only show when zoomed in
      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15, // Only render when zoomed in
          maxzoom: 22,
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
            'fill-extrusion-opacity': 0.5 // Slightly more transparent for performance
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
      el.style.transition = 'transform 0.2s';
      el.style.animation = 'pulse 2s infinite';

      // Get neighborhood risk for this location
      const markerRisk = assessNeighborhoodRisk(request.location.lat, request.location.lng, request.location.address);

      // Color based on tone
      const toneColors: Record<string, string> = {
        Distressed: '#ef4444',
        Anxious: '#f59e0b',
        Calm: '#3b82f6'
      };
      el.style.backgroundColor = toneColors[request.tone] || '#3b82f6';
      
      // Add colored glow based on neighborhood risk
      el.style.boxShadow = `0 0 20px ${markerRisk.color}80, 0 4px 12px rgba(0,0,0,0.4)`;
      el.style.border = `3px solid ${markerRisk.color}`;

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

      const safetyScore = (request as any).safetyScore || 0;
      const safetyBadge = safetyScore >= 4 ? `<span style="font-size: 12px; font-weight: bold; background-color: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px;">🚨 Risk: ${safetyScore}/5</span>` : 
        safetyScore >= 3 ? `<span style="font-size: 12px; font-weight: bold; background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px;">⚠️ Risk: ${safetyScore}/5</span>` :
        safetyScore > 0 ? `<span style="font-size: 12px; background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px;">✅ Risk: ${safetyScore}/5</span>` : '';

      // Get neighborhood risk assessment
      const neighborhoodRisk = assessNeighborhoodRisk(request.location.lat, request.location.lng, request.location.address);

      const popupContent = `
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${request.name || 'Anonymous'}</h3>
          <p style="font-size: 14px; margin-bottom: 8px; color: #374151;">${request.description}</p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; background-color: ${request.tone === 'Distressed' ? '#fee2e2' : request.tone === 'Anxious' ? '#fef3c7' : '#dbeafe'}; color: ${request.tone === 'Distressed' ? '#991b1b' : request.tone === 'Anxious' ? '#92400e' : '#1e40af'}; padding: 4px 8px; border-radius: 4px;">${request.tone}</span>
            <span style="font-size: 12px; background-color: ${request.status === 'resolved' ? '#d1fae5' : request.status === 'assigned' ? '#dbeafe' : '#f3f4f6'}; color: ${request.status === 'resolved' ? '#065f46' : request.status === 'assigned' ? '#1e40af' : '#374151'}; padding: 4px 8px; border-radius: 4px;">${request.status}</span>
            ${safetyBadge}
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${request.location.address}</p>
          
          <!-- Neighborhood Risk Assessment -->
          <div style="background-color: ${neighborhoodRisk.color}15; border-left: 4px solid ${neighborhoodRisk.color}; padding: 10px; margin: 10px 0; border-radius: 4px;">
            <div style="font-size: 13px; font-weight: bold; color: ${neighborhoodRisk.color}; margin-bottom: 4px;">
              ${neighborhoodRisk.risk === 'High Risk Area' ? '⚠️' : neighborhoodRisk.risk === 'Moderate Risk Area' ? '⚡' : '✅'} 
              ${neighborhoodRisk.risk}
            </div>
            <div style="font-size: 11px; color: #374151; line-height: 1.4;">
              ${neighborhoodRisk.description}
            </div>
          </div>
          
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

    // Fit bounds to show all markers with smooth animation
    if (safeRequests.length > 0 || safeResources.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      [...safeRequests, ...safeResources].forEach(item => {
        bounds.extend([item.location.lng, item.location.lat]);
      });
      map.current?.fitBounds(bounds, { 
        padding: 50, 
        maxZoom: 15,
        duration: 1000, // Smooth 1s animation
        essential: true
      });
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
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-300">
      <div ref={mapContainer} className="w-full h-full transition-opacity duration-500" style={{ opacity: mapLoaded ? 1 : 0.3 }} />

      {/* Compact Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md rounded-lg p-2 shadow-lg text-[10px] max-w-[140px] transition-all duration-300 hover:shadow-xl">
        <div className="space-y-0.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🆘</span>
            <span className="text-gray-700">Requests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🍎</span>
            <span className="text-gray-700">Food</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🏠</span>
            <span className="text-gray-700">Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⚖️</span>
            <span className="text-gray-700">Legal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🏥</span>
            <span className="text-gray-700">Medical</span>
          </div>
        </div>
        
        {/* Neighborhood Risk Legend */}
        <div className="border-t border-gray-200 pt-1.5 mt-1.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <span className="text-gray-700">High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-700">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <span className="text-gray-700">Low Risk</span>
            </div>
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

      {/* Enhanced CSS for smooth animations */}
      <style>{`
        /* Smooth pulse animation */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        
        /* Optimize marker rendering for 60fps */
        .custom-marker {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          transform: translateZ(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Smooth popup animations */
        .mapboxgl-popup {
          animation: popupFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Smooth map controls */
        .mapboxgl-ctrl-group {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .mapboxgl-ctrl-group button {
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mapboxgl-ctrl-group button:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Smooth marker hover effects */
        .custom-marker:hover {
          transform: scale(1.15) translateZ(0);
          z-index: 100;
          filter: brightness(1.1);
        }
        
        /* Smooth navigation controls */
        .mapboxgl-ctrl-compass,
        .mapboxgl-ctrl-zoom-in,
        .mapboxgl-ctrl-zoom-out,
        .mapboxgl-ctrl-geolocate {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                      background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Remove map attribution (cleaner UI) */
        .mapboxgl-ctrl-attrib {
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        
        .mapboxgl-ctrl-attrib:hover {
          opacity: 1;
        }
        
        /* Smooth loading spinner */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
