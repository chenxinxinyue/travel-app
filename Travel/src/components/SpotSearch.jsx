import { useState, useEffect, useRef } from 'react';

export default function SpotSearch({ onResults, city, mapRef, mapReady }) {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const infoWindowRef = useRef(null);

  const doSearch = async (kw) => {
    if (!kw.trim()) return;
    if (!mapRef.current) { setError('地图还在加载中...'); return; }
    setError('');
    setSearching(true);
    try {
      const results = await mapRef.current.searchPOI(kw, city || '全国');
      onResults(results);

      if (results.length === 0) {
        setError('未找到相关景点');
      } else {
        const { AMap } = mapRef.current;
        mapRef.current.clearMarkers();
        if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
        results.forEach((poi) => {
          const [lng, lat] = [poi.location.lng, poi.location.lat];
          const content = `<div style="padding:4px 8px;max-width:200px"><b>${poi.name}</b><br><span style="font-size:11px;color:#666">${poi.address || ''}</span></div>`;
          const marker = new AMap.Marker({ position: [lng, lat], title: poi.name });
          marker.on('click', () => {
            mapRef.current.map.setZoomAndCenter(15, [lng, lat]);
            if (infoWindowRef.current) infoWindowRef.current.close();
            infoWindowRef.current = new AMap.InfoWindow({ content, offset: new AMap.Pixel(0, -30) });
            infoWindowRef.current.open(mapRef.current.map, marker.getPosition());
          });
          mapRef.current.map.add(marker);
          mapRef.current.markersRef.current.push(marker);
        });
        mapRef.current.fitView(results.map((p) => ({ lng: p.location.lng, lat: p.location.lat })));
      }
    } catch { setError('搜索失败，请重试'); }
    finally { setSearching(false); }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setKeyword(v);
    setError('');
    clearTimeout(timerRef.current);
    if (!v.trim()) { onResults([]); return; }
    timerRef.current = setTimeout(() => doSearch(v), 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      if (!keyword.trim()) { onResults([]); return; }
      doSearch(keyword);
    }
  };

  return (
    <div className="px-3 py-2 bg-white border-b">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
          placeholder={mapReady ? (city ? `搜索${city}的景点...` : '搜索景点...') : '地图加载中...'}
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!mapReady}
        />
        <button onClick={() => doSearch(keyword)} disabled={searching || !mapReady}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {searching ? '搜索中' : '搜索'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
