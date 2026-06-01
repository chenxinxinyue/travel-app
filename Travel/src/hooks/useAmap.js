import { useEffect, useRef, useState, useCallback } from 'react';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET;
const AMAP_WS_KEY = import.meta.env.VITE_AMAP_WS_KEY;

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

      // Controls loaded asynchronously after map init
      amap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
        mapInstance.addControl(new amap.Scale());
        mapInstance.addControl(new amap.ToolBar({ position: 'RT' }));
      });

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

  // POI search using Web Service API via JSONP
  const searchPOI = useCallback(async (keyword, city) => {
    if (!AMAP_WS_KEY) return [];

    return new Promise((resolve) => {
      const callbackName = '_amap_cb_' + Date.now();
      const params = new URLSearchParams({
        key: AMAP_WS_KEY,
        keywords: keyword,
        city: city || '',
        extensions: 'all',
        offset: '20',
        callback: callbackName,
      });

      window[callbackName] = (data) => {
        delete window[callbackName];
        document.head.removeChild(script);
        if (data.status === '1' && data.pois) {
          resolve(data.pois.map((poi) => {
            const [lng, lat] = (poi.location || '0,0').split(',').map(Number);
            return {
              id: poi.id,
              name: poi.name,
              address: poi.address || '',
              location: { lng, lat },
            };
          }));
        } else {
          resolve([]);
        }
      };

      const script = document.createElement('script');
      script.src = `https://restapi.amap.com/v3/place/text?${params}`;
      script.onerror = () => { resolve([]); };
      document.head.appendChild(script);
    });
  }, []);

  // Add a participant location marker
  const addParticipantMarker = useCallback((lng, lat, nickname, color) => {
    if (!AMap || !map) return null;
    const marker = new AMap.Marker({
      position: [lng, lat],
      icon: new AMap.Icon({
        size: new AMap.Size(20, 20),
        image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='${encodeURIComponent(color)}' stroke='white' stroke-width='2'/%3E%3C/svg%3E`,
        imageSize: new AMap.Size(20, 20),
      }),
      title: nickname,
      zIndex: 90,
    });
    map.add(marker);
    return marker;
  }, [AMap, map]);

  return { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView, searchPOI, currentMarkerRef, markersRef, addParticipantMarker };
}
