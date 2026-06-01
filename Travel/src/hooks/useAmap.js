import { useEffect, useRef, useState, useCallback } from 'react';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET;

// Dynamically load AMap JS API
function loadAmapScript(key, secret) {
  return new Promise((resolve, reject) => {
    if (window.AMap) { resolve(window.AMap); return; }
    const script = document.createElement('script');
    const secretParam = secret ? `&jscode=${secret}` : '';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}${secretParam}`;
    script.onload = () => resolve(window.AMap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function useAmap(containerRef) {
  const [map, setMap] = useState(null);
  const [AMap, setAMap] = useState(null);
  const [ready, setReady] = useState(false);
  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    loadAmapScript(AMAP_KEY, AMAP_SECRET).then((amap) => {
      if (cancelled) return;
      setAMap(amap);

      const mapInstance = new amap.Map(containerRef.current, {
        zoom: 12,
        center: [116.397428, 39.90923], // default Beijing, will be overridden by geolocation
      });

      mapInstance.addControl(new amap.Scale());
      mapInstance.addControl(new amap.ToolBar({ position: 'RT' }));

      setMap(mapInstance);
      setReady(true);
    });

    return () => { cancelled = true; };
  }, [containerRef]);

  // Geolocate current position
  const locateMe = useCallback(() => {
    if (!AMap || !map) return;
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          map.setCenter([result.position.lng, result.position.lat]);
          if (currentMarkerRef.current) {
            map.remove(currentMarkerRef.current);
          }
          currentMarkerRef.current = new AMap.Marker({
            position: [result.position.lng, result.position.lat],
            icon: new AMap.Icon({
              size: new AMap.Size(24, 24),
              image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
              imageSize: new AMap.Size(24, 24),
            }),
            zIndex: 100,
          });
          map.add(currentMarkerRef.current);
        }
      });
    });
  }, [AMap, map]);

  // Add a marker to the map
  const addMarker = useCallback((lng, lat, options = {}) => {
    if (!AMap || !map) return null;
    const marker = new AMap.Marker({
      position: [lng, lat],
      ...options,
    });
    map.add(marker);
    markersRef.current.push(marker);
    return marker;
  }, [AMap, map]);

  // Clear all search/spot markers (keep current location marker)
  const clearMarkers = useCallback(() => {
    if (!map) return;
    markersRef.current.forEach((m) => map.remove(m));
    markersRef.current = [];
  }, [map]);

  // Fit view to include all given positions
  const fitView = useCallback((positions) => {
    if (!map || positions.length === 0) return;
    map.setFitView(positions.map((p) => new AMap.LngLat(p.lng, p.lat)));
  }, [map, AMap]);

  // POI search
  const searchPOI = useCallback(async (keyword, city) => {
    if (!AMap) return [];
    return new Promise((resolve) => {
      AMap.plugin('AMap.PlaceSearch', () => {
        const search = new AMap.PlaceSearch({
          city,
          pageSize: 20,
          extensions: 'all',
        });
        search.search(keyword, (status, result) => {
          if (status === 'complete' && result.poiList) {
            resolve(result.poiList.pois);
          } else {
            resolve([]);
          }
        });
      });
    });
  }, [AMap]);

  return { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView, searchPOI, currentMarkerRef, markersRef };
}
