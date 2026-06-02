import { useEffect, useRef, useState, useCallback } from 'react';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET;
const AMAP_WS_KEY = import.meta.env.VITE_AMAP_WS_KEY;

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
  const myMarkerRef = useRef(null);
  const spotMarkersRef = useRef([]);
  const searchMarkersRef = useRef([]);
  const friendMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    loadAmapScript(AMAP_KEY, AMAP_SECRET).then((amap) => {
      if (cancelled) return;
      setAMap(amap);
      const mapInstance = new amap.Map(containerRef.current, { zoom: 12, center: [116.397428, 39.90923] });
      amap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
        mapInstance.addControl(new amap.Scale());
        mapInstance.addControl(new amap.ToolBar({ position: 'RT' }));
      });
      setMap(mapInstance);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [containerRef]);

  // Locate city
  const locateCity = useCallback((cityName) => {
    if (!AMap || !map || !cityName) return;
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder({ city: cityName });
      geocoder.getLocation(cityName, (status, result) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const { lng, lat } = result.geocodes[0].location;
          map.setZoomAndCenter(12, [lng, lat]);
        }
      });
    });
  }, [AMap, map]);

  // Locate me
  const locateMe = useCallback(() => {
    if (!AMap || !map) return;
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 10000 });
      map.addControl(geolocation);
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          map.setZoomAndCenter(16, [result.position.lng, result.position.lat]);
          if (myMarkerRef.current) map.remove(myMarkerRef.current);
          myMarkerRef.current = new AMap.Marker({
            position: [result.position.lng, result.position.lat],
            icon: new AMap.Icon({ size: new AMap.Size(24, 24), image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png', imageSize: new AMap.Size(24, 24) }),
            zIndex: 100,
          });
          map.add(myMarkerRef.current);
        }
      });
    });
  }, [AMap, map]);

  // Make info window HTML with optional "想去" button
  const makeInfoContent = (name, address, extra, showWantBtn) => {
    const wantBtn = showWantBtn ? `<button onclick="window.__travelWantToGo?.()" style="margin-top:4px;background:#3B82F6;color:#fff;border:none;border-radius:4px;padding:2px 8px;font-size:12px;cursor:pointer">想去</button>` : '';
    return `<div style="padding:6px 10px;max-width:220px"><b>${name}</b><div style="font-size:11px;color:#666;margin:2px 0">${address||''}${extra||''}</div>${wantBtn}</div>`;
  };

  // Show search markers
  const showSearchMarkers = useCallback((pois) => {
    if (!AMap || !map) return;
    clearSearchMarkers();
    if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
    const positions = [];
    pois.forEach((poi) => {
      const [lng, lat] = [poi.location.lng, poi.location.lat];
      const marker = new AMap.Marker({ position: [lng, lat], title: poi.name, zIndex: 80 });
      marker.on('click', () => {
        window.__travelPendingSpot = poi;
        map.stopMove();
        map.setZoomAndCenter(16, [lng, lat]);
        if (infoWindowRef.current) infoWindowRef.current.close();
        infoWindowRef.current = new AMap.InfoWindow({ content: makeInfoContent(poi.name, poi.address, '', true), offset: new AMap.Pixel(0, -30) });
        infoWindowRef.current.open(map, marker.getPosition());
      });
      map.add(marker);
      searchMarkersRef.current.push(marker);
      positions.push({ lng, lat });
    });
    if (positions.length > 0) {
      const sw = new AMap.LngLat(positions[0].lng, positions[0].lat);
      const ne = new AMap.LngLat(positions[0].lng, positions[0].lat);
      positions.forEach(p => { sw.lng = Math.min(sw.lng, p.lng); sw.lat = Math.min(sw.lat, p.lat); ne.lng = Math.max(ne.lng, p.lng); ne.lat = Math.max(ne.lat, p.lat); });
      map.setBounds(new AMap.Bounds(sw, ne), false, [60, 60, 60, 60]);
    }
  }, [AMap, map]);

  const clearSearchMarkers = useCallback(() => {
    if (!map) return;
    searchMarkersRef.current.forEach(m => map.remove(m));
    searchMarkersRef.current = [];
    delete window.__travelPendingSpot;
  }, [map]);

  // Show spot markers
  const showSpotMarkers = useCallback((spots) => {
    if (!AMap || !map) return;
    spotMarkersRef.current.forEach(m => map.remove(m));
    spotMarkersRef.current = [];
    spots.forEach(spot => {
      const marker = new AMap.Marker({
        position: [spot.lng, spot.lat],
        title: spot.name,
        zIndex: 70,
        label: { content: spot.name, direction: 'top', offset: new AMap.Pixel(0, -10) },
      });
      marker.on('click', () => {
        map.stopMove();
        map.setZoomAndCenter(16, [spot.lng, spot.lat]);
        if (infoWindowRef.current) infoWindowRef.current.close();
        infoWindowRef.current = new AMap.InfoWindow({
          content: makeInfoContent(spot.name, spot.address, spot.added_by ? ' · '+spot.added_by+'添加' : ''),
          offset: new AMap.Pixel(0, -30),
        });
        infoWindowRef.current.open(map, marker.getPosition());
      });
      map.add(marker);
      spotMarkersRef.current.push(marker);
    });
  }, [AMap, map]);

  // Show friend markers
  const showFriendMarkers = useCallback((participants, locations) => {
    if (!AMap || !map) return;
    friendMarkersRef.current.forEach(m => map.remove(m));
    friendMarkersRef.current = [];
    participants.forEach(p => {
      const loc = locations.find(l => l.participant_id === p._id);
      if (loc) {
        const marker = new AMap.Marker({
          position: [loc.lng, loc.lat],
          icon: new AMap.Icon({
            size: new AMap.Size(20, 20),
            image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='${encodeURIComponent(p.color)}' stroke='white' stroke-width='2'/%3E%3C/svg%3E`,
            imageSize: new AMap.Size(20, 20),
          }),
          title: p.nickname,
          zIndex: 90,
        });
        map.add(marker);
        friendMarkersRef.current.push(marker);
      }
    });
  }, [AMap, map]);

  // Fit view to positions
  const fitView = useCallback((positions) => {
    if (!map || !AMap || positions.length === 0) return;
    try {
      const sw = new AMap.LngLat(positions[0].lng, positions[0].lat);
      const ne = new AMap.LngLat(positions[0].lng, positions[0].lat);
      positions.forEach(p => { sw.lng = Math.min(sw.lng, p.lng); sw.lat = Math.min(sw.lat, p.lat); ne.lng = Math.max(ne.lng, p.lng); ne.lat = Math.max(ne.lat, p.lat); });
      map.stopMove();
      map.setBounds(new AMap.Bounds(sw, ne), false, [60, 60, 60, 60]);
    } catch {}
  }, [map, AMap]);

  // Search POI by keyword
  const searchPOI = useCallback(async (keyword, city) => {
    if (!AMAP_WS_KEY) return [];
    return new Promise((resolve) => {
      const cb = '_acb_' + Math.random().toString(36).slice(2, 10);
      let done = false;
      const finish = (r) => { if (done) return; done = true; clearTimeout(t); delete window[cb]; if (s.parentNode) s.remove(); resolve(r); };
      const t = setTimeout(() => finish([]), 15000);
      window[cb] = (d) => {
        if (d?.status === '1' && d.pois) {
          finish(d.pois.map(p => ({ id: p.id, name: p.name, address: p.address || '', location: { lng: +p.location.split(',')[0], lat: +p.location.split(',')[1] } })));
        } else finish([]);
      };
      const s = document.createElement('script');
      s.src = `https://restapi.amap.com/v3/place/text?key=${AMAP_WS_KEY}&keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city||'')}&extensions=all&callback=${cb}`;
      s.onerror = () => finish([]);
      document.head.appendChild(s);
    });
  }, []);

  // Search around a coordinate
  const searchAround = useCallback(async (lng, lat) => {
    if (!AMAP_WS_KEY) return [];
    return new Promise((resolve) => {
      const cb = '_aar_' + Math.random().toString(36).slice(2, 10);
      let done = false;
      const t = setTimeout(() => { done = true; delete window[cb]; resolve([]); }, 10000);
      window[cb] = (d) => {
        if (done) return; done = true; clearTimeout(t); delete window[cb];
        if (d?.status === '1' && d.pois) {
          resolve(d.pois.map(p => ({ id: p.id, name: p.name, address: p.address || '', location: { lng: +p.location.split(',')[0], lat: +p.location.split(',')[1] } })));
        } else resolve([]);
      };
      const s = document.createElement('script');
      s.src = `https://restapi.amap.com/v3/place/around?key=${AMAP_WS_KEY}&location=${lng},${lat}&radius=1000&extensions=all&callback=${cb}`;
      s.onerror = () => { done = true; resolve([]); };
      document.head.appendChild(s);
    });
  }, []);

  return {
    map, AMap, ready, locateMe, locateCity,
    showSearchMarkers, clearSearchMarkers, showSpotMarkers, showFriendMarkers,
    fitView, searchPOI, searchAround,
  };
}
