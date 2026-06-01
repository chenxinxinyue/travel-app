import { useState } from 'react';

export default function SpotSearch({ onResults, city, mapRef, mapReady }) {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    if (!mapRef.current) {
      setError('地图还在加载中...');
      return;
    }
    setError('');
    setSearching(true);
    try {
      const results = await mapRef.current.searchPOI(keyword, city || '全国');
      onResults(results);

      if (results.length === 0) {
        setError('未找到相关景点');
      } else if (results.length > 0) {
        const { AMap } = mapRef.current;
        mapRef.current.clearMarkers();
        results.forEach((poi) => {
          const [lng, lat] = [poi.location.lng, poi.location.lat];
          const marker = new AMap.Marker({
            position: [lng, lat],
            title: poi.name,
          });
          mapRef.current.map.add(marker);
          mapRef.current.markersRef.current.push(marker);
        });
        mapRef.current.fitView(results.map((p) => ({ lng: p.location.lng, lat: p.location.lat })));
      }
    } catch (e) {
      setError('搜索失败，请重试');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="px-3 py-2 bg-white border-b">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
          placeholder={mapReady ? `搜索${city ? city + '的' : ''}景点...` : '地图加载中...'}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={!mapReady}
        />
        <button onClick={handleSearch} disabled={searching || !mapReady}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {searching ? '搜索中' : '搜索'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
