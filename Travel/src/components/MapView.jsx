import { useRef, useEffect, memo } from 'react';
import useAmap from '../hooks/useAmap';

const MapView = memo(function MapView({ spots, participants, locations, onMapReady, onMapClick }) {
  const containerRef = useRef(null);
  const { map, AMap, ready, locateMe, locateCity, showSpotMarkers, showFriendMarkers, onWantToGoRef } = useAmap(containerRef);
  const firstLocateRef = useRef(false);

  useEffect(() => {
    if (ready && !firstLocateRef.current) {
      firstLocateRef.current = true;
      locateMe();
    }
  }, [ready, locateMe]);

  useEffect(() => {
    if (ready && map) onMapReady?.({ map, AMap, locateMe, locateCity, onWantToGoRef });
  }, [ready, map, AMap]);

  // Show timeline spot markers
  useEffect(() => {
    if (!ready || !AMap) return;
    showSpotMarkers(spots);
  }, [spots, ready, AMap, showSpotMarkers]);

  // Show friend markers
  useEffect(() => {
    if (!ready || !AMap) return;
    showFriendMarkers(participants, locations);
  }, [participants, locations, ready, AMap, showFriendMarkers]);

  // Map click -> discover POIs
  useEffect(() => {
    if (!ready || !map || !AMap || !onMapClick) return;
    const handler = (e) => onMapClick({ lng: e.lnglat.lng, lat: e.lnglat.lat });
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [ready, map, AMap, onMapClick]);

  return <div ref={containerRef} className="w-full h-full" />;
});

export default MapView;
