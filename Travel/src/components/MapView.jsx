import { useRef, useEffect } from 'react';
import useAmap from '../hooks/useAmap';

export default function MapView({ spots, participants, locations, onMapReady }) {
  const containerRef = useRef(null);
  const { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView, searchPOI, markersRef, addParticipantMarker } = useAmap(containerRef);
  const firstLocateRef = useRef(false);
  const participantMarkersRef = useRef([]);

  // Auto-locate on first load
  useEffect(() => {
    if (ready && !firstLocateRef.current) {
      firstLocateRef.current = true;
      locateMe();
    }
  }, [ready, locateMe]);

  // Notify parent when map is ready
  useEffect(() => {
    if (ready && map) onMapReady?.({ map, AMap, locateMe, addMarker, clearMarkers, fitView, searchPOI, markersRef, addParticipantMarker });
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

  // Update participant location markers
  useEffect(() => {
    if (!ready || !AMap) return;

    participantMarkersRef.current.forEach((m) => map.remove(m));
    participantMarkersRef.current = [];

    participants.forEach((p) => {
      const loc = locations.find((l) => l.participant_id === p._id);
      if (loc) {
        const marker = addParticipantMarker(loc.lng, loc.lat, p.nickname, p.color);
        if (marker) participantMarkersRef.current.push(marker);
      }
    });
  }, [participants, locations, ready, AMap, addParticipantMarker]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
