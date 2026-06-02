import { useRef, useEffect, memo } from 'react';
import useAmap from '../hooks/useAmap';

const MapView = memo(function MapView({ spots, participants, locations, onMapReady, onMapClick }) {
  const containerRef = useRef(null);
  const { map, AMap, ready, locateMe, locateCity, addMarker, clearMarkers, fitView, searchPOI, searchAround, markersRef, addParticipantMarker } = useAmap(containerRef);
  const firstLocateRef = useRef(false);
  const participantMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (ready && !firstLocateRef.current) {
      firstLocateRef.current = true;
      locateMe();
    }
  }, [ready, locateMe]);

  // Map click to discover POIs
  useEffect(() => {
    if (!ready || !map || !AMap || !onMapClick) return;
    const handler = (e) => {
      onMapClick({ lng: e.lnglat.lng, lat: e.lnglat.lat });
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [ready, map, AMap, onMapClick]);

  useEffect(() => {
    if (ready && map) onMapReady?.({ map, AMap, locateMe, locateCity, addMarker, clearMarkers, fitView, searchPOI, searchAround, markersRef, addParticipantMarker });
  }, [ready, map, AMap]);

  useEffect(() => {
    if (!ready || !AMap) return;
    if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
    clearMarkers();
    const positions = [];
    spots.forEach((spot) => {
      const marker = addMarker(spot.lng, spot.lat, {
        title: spot.name,
        label: { content: spot.name, direction: 'top', offset: new AMap.Pixel(0, -10) },
      });
      if (marker) {
        const content = `<div style="padding:6px 10px;max-width:220px"><b>${spot.name}</b><div style="font-size:11px;color:#666;margin:2px 0">${spot.address||''}${spot.added_by ? ' · '+spot.added_by+'添加' : ''}</div></div>`;
        marker.on('click', () => {
          map.setZoomAndCenter(15, [spot.lng, spot.lat]);
          if (infoWindowRef.current) infoWindowRef.current.close();
          infoWindowRef.current = new AMap.InfoWindow({ content, offset: new AMap.Pixel(0, -30) });
          infoWindowRef.current.open(map, marker.getPosition());
        });
      }
      positions.push({ lng: spot.lng, lat: spot.lat });
    });
    if (positions.length > 0) fitView(positions);
  }, [spots, ready, AMap, addMarker, clearMarkers, fitView]);

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
});

export default MapView;
