import { useRef, useEffect } from 'react';
import useAmap from '../hooks/useAmap';

export default function MapView({ spots, participants, onMapReady }) {
  const containerRef = useRef(null);
  const { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView, searchPOI, markersRef } = useAmap(containerRef);
  const firstLocateRef = useRef(false);

  // Auto-locate on first load
  useEffect(() => {
    if (ready && !firstLocateRef.current) {
      firstLocateRef.current = true;
      locateMe();
    }
  }, [ready, locateMe]);

  // Notify parent when map is ready
  useEffect(() => {
    if (ready && map) onMapReady?.({ map, AMap, locateMe, addMarker, clearMarkers, fitView, searchPOI, markersRef });
  }, [ready, map, AMap]);

  // Update markers when spots change
  useEffect(() => {
    if (!ready || !AMap) return;
    clearMarkers();

    const positions = [];

    spots.forEach((spot) => {
      addMarker(spot.lng, spot.lat, {
        title: spot.name,
        label: { content: spot.name, direction: 'top', offset: new AMap.Pixel(0, -10) },
      });
      positions.push({ lng: spot.lng, lat: spot.lat });
    });

    if (positions.length > 0) fitView(positions);
  }, [spots, ready, AMap, addMarker, clearMarkers, fitView]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
